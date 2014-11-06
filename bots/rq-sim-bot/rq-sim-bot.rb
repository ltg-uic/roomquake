=begin
require 'simple_ruby_mqtt_client'
require 'json'
require 'set'

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
    @actor_name = config_actor_name(@run_id)
    @sc = SimpleMQTTClient.new(args[1], @actor_name)
    @last_requests = Set.new
  end
  
  # Subscribe to a channel
  # The callback takes one parameter and that is the message that is received. 
  # Messages that are not JSON are discarded.
  def subscribe (channel, callback)
    # Pad the channel
    new_channel = @run_id + '/' + channel
    # Subscribe 
    @sc.subscribe(new_channel, lambda do |message| 
      # Make sure the message is JSON, if not drop the message
      begin
        message_hash = JSON.parse(message)
        callback.call(message_hash)
      rescue
        return
      end
    end)    
  end
  
  # Unsubscribe from a channel
  def unsubscribe(channel) 
    # Pad the channel
    new_channel = @run_id + '/' + channel
    # Unsubscribe
    @sc.unsubscribe(new_channel)
  end
  
  # Publishes a message to a channel
  # Message can be: 
  # empty (equivalent of a GET)
  # string (the string will be wrapped into a JSON string automatically. Format: {"payload":"<message>"})
  # hash (the hash will be converted into a JSON string automatically)
  # json string (the JSON string will be sent as is)
  def publish(channel, message)
    # Verify that the message is proper JSON
    # Pad the channel
    new_channel = @run_id + '/' + channel
    # Publish
    begin
      m = prepare_message_for_publish(message)
      @sc.publish(new_channel, m)
    rescue
      STDERR.puts $!
    end
  end
  
  # Performs a synchronosus request
  # Message can be:
  # empty (equivalent of a GET)
  # string (the string will be wrapped into a JSON string automatically. Format: {"payload":"<message>"})
  # hash (the hash will be converted into a JSON string automatically)
  # json string (the JSON string will be sent as is)
  def sync_req (channel, message="")
    # Generate message unique id
    id = message.hash 
    # Attach id
    begin
      payload = attach_message_id(message, id)
    rescue
      STDERR.puts $!
      return
    end
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
    begin
      payload = attach_message_id(message, id)
    rescue
      STDERR.puts $!
      return
    end
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
        res_and_id = attach_message_id(res, id)
        publish(channel, res_and_id)
      rescue
        STDERR.puts 'When handling a request you need to retun JSON'
      end
    end)
  end
  
  
  private 
  
  def config_actor_name (run_id)
    h = JSON.parse( IO.read( "nutella.json" ) )
    full_actor_name = @run_id + '_' + h["name"]
    full_actor_name[0, 23]
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
    else
      raise 'Your request is not JSON!'
    end
    payload
  end
  
  def prepare_message_for_publish (message) 
    if message.is_a?(Hash)
      message[:from] = @actor_name
      payload = message.to_json
    elsif message.is_json?
      p = JSON.parse(message)
      message[:from] = @actor_name
      payload = p.to_json
    elsif message.is_a?(String)
      payload = { :payload => message, :from => @actor_name }.to_json
    else
      raise 'You are trying to publish something that is not JSON!'
    end
    payload
  end
end
=end

require 'nutella_lib'

# Initialize nutella
nutella.init ARGV

# handle quakes schedule request
nutella.net.handle_requests("quakes_schedule") do |req|
  JSON.parse( IO.read( "db/quakes_schedule.json" ) )
end

# handle room configuration request
nutella.net.handle_requests("room_configuration") do |req|
   JSON.parse( IO.read( "db/room_config.json" ) )
end

nutella.net.subscribe("schedule_update", lambda do |message|
   p message
 end)

begin
  while true
    sleep(5)
  end
rescue Interrupt
  # terminates
end
