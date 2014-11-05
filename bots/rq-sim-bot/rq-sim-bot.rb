require 'simple_ruby_mqtt_client'
require 'json'
require 'set'

# Parse arguments
# Connect to MQTT
# Implement higher level publish/subscribe/unsubscribe/sync_req/async_req

class String
  def is_json?
    begin
      !!JSON.parse(self)
    rescue
      false
    end
  end
end


class Nutella
  
  def init(args)
    @run_id = args[0]
    bot_name = @run_id + '_' + config_bot_name()
    bot_name = bot_name[0, 23]
    @sc = SimpleMQTTClient.new(args[1], bot_name)
    @last_requests = Set.new
  end
    
  def subscribe (channel, callback)
    # Pad the channel
    new_channel = @run_id + '/' + channel
    # Subscribe
    @sc.subscribe(new_channel, callback)    
  end
  
  def unsubscribe(channel) 
    # Pad the channel
    new_channel = @run_id + '/' + channel
    # Unsubscribe
    @sc.unsubscribe(new_channel)
  end
  
  def publish(channel, message)
    # Pad the channel
    new_channel = @run_id + '/' + channel
    # Publish
    @sc.publish(new_channel, message)
  end
  
  # Performs a synchronosus request
  # Message can be :
  # empty (equivalent of a GET)
  # string (the string will be wrapped into a JSON string automatically. Format: {"payload":"<message>"})
  # hash (the hash will be converted into a JSON string automatically)
  # json string (the JSON string will be sent as is)
  def sync_req (channel, message="")
    # Generate message unique id
    id = message.hash 
    # Attach id
    payload = attach_message_id(message, id)
    # Initialize response and response counter
    ready_to_go = 2
    response = nil
    # Subscribe to same channel to collect response
    subscribe(channel, lambda do |p|
      p_h = JSON.parse(p)
      if (p_h["id"]==id)
        ready_to_go -= 1
        if ready_to_go
          unsubscribe(channel)
          response = p
        end
      end
    end)
    # Send message the message
    publish(channel, payload)
    # Wait for the response to come back
    sleep(0.5) until ready_to_go==0
    response
  end
    
  # Performs an asynchronosus request
  # Message can be:
  # empty (equivalent of a GET)
  # string (the string will be wrapped into a JSON string automatically. Format: {"payload":"<message>"})
  # hash (the hash will be converted into a JSON string automatically)
  # json string (the JSON string will be sent as is)
  def async_req (channel, message="", callback)
    # Generate message unique id
    id = message.hash 
    # Attach id
    payload = attach_message_id(message, id)
    # Initialize flag that prevents handling of our own messages
    ready_to_go = false
    # Register callback to handle data the request response whenever it comes
    subscribe(channel, lambda do |m|
      # Check that the message we receive is not the one we are sending ourselves.
      p_h = JSON.parse(m)
      if p_h["id"]==id
        if ready_to_go
          unsubscribe(channel)
          callback.call(m)
        else
          ready_to_go = true
        end
      end
    end)
    # Send message
    publish(channel, payload)
  end
  
  # Handles requests on a certain channel
  def handle_requests (channel, &handler)
    subscribe(channel, lambda do |m|
      begin
        req = JSON.parse(m)
        id = req["id"]
        if id.nil?
          raise
        end
      rescue
        # Ignore anything that's not JSON
        return
      end
      # Ignore recently processed requests
      if @last_requests.include?(id)
        @last_requests.delete(id)
        return
      end
      @last_requests.add(id)
      req.delete("id")
      res = handler.call(req)
      begin
        if !res.is_a?(Hash)
          raise 'When handling a request you always need to return a hash!'
        end
        res[:id]=id
        publish(channel, res.to_json)
      rescue
        STDERR.puts $!
      end
    end)
  end
  
  
  private 
  
  def config_bot_name 
    h = JSON.parse( IO.read( "nutella.json" ) )
    return h["name"]
  end
  
  
  def attach_message_id (message, id) 
    if message.is_a?(Hash)
      message[:id] = id
      payload = message.to_json
    elsif message.is_json?
      p = JSON.parse(message)
      p[:id] = id
      payload = p.to_json
    elsif message.is_a?(String)
      payload = { :payload => message, :id => id }.to_json
    end
    payload
  end
end


# Initialize nutella
n = Nutella.new;
n.init(ARGV)

# handle quakes schedule request
n.handle_requests("quakes_schedule") do |req|
  JSON.parse( IO.read( "db/quakes_schedule.json" ) )
end

# handle room configuration request
n.handle_requests("room_configuration") do |req|
  JSON.parse( IO.read( "db/quakes_schedule.json" ) )
end



begin
  while true
    sleep(5)
  end
rescue Interrupt
  # terminates
end
