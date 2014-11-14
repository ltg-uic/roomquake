require 'nutella_lib'

# Initialize nutella
nutella.init ARGV

# Initialize storage
obs_store = nutella.persist.getJsonStore("db/observations.json")
room_store = nutella.persist.getJsonStore("db/room_config.json")
quakes_store = nutella.persist.getJsonStore("db/quakes_schedule.json")

# handle quakes schedule request
nutella.net.handle_requests("quakes_schedule") do |req|
  quakes_store.transaction { quakes_store.to_h }
end

# handle room configuration request
nutella.net.handle_requests("room_configuration") do |req|
  room_store.transaction { room_store.to_h }
end

# handle observations requests
nutella.net.handle_requests("observations") do |req|
  obs_store.transaction { obs_store.to_h }
end



# handle room configuration updates
nutella.net.subscribe("room_config_update", lambda do |m|
  m.delete "from"
  room_store.transaction { room_store.merge! m }
end)

# handle quakes schedule updates
nutella.net.subscribe("quakes_schedule_update", lambda do |m|
  m.delete "from"
  # add quake to array of quakes
  quakes_store.transaction {
    quakes_store['quakes_schedule'] = Array.new if quakes_store['quakes_schedule'].nil?
    quakes_store['quakes_schedule'].push(m)
  }
end)

# handle students observations updates
nutella.net.subscribe("quake_reports", lambda do |m|
  obs_store.transaction do
    obs_array = obs_store["observations"]
    obs_array[m["seismograph"]-1].push(m["distance"])
    obs_store["observations"] = obs_array
  end
end);

# handle observations wiping
nutella.net.subscribe("wipe_observations", lambda do |m|
  s = room_store.transaction { room_store["seismographs"] }
  obs_store.transaction do
    obs_array = obs_store["observations"]
    for i in 0..s.length
      obs_array[i] = []
    end
  end
end);


# Just sit there waiting for messages to come
nutella.net.listen
