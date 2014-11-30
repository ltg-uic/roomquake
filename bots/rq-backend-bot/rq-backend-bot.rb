require 'nutella_lib'

# Initialize nutella
nutella.init ARGV

# Initialize storage
room_store = nutella.persist.getJsonStore('db/room_config.json')
quakes_store = nutella.persist.getJsonStore('db/quakes_schedule.json')
demo_quakes_store = nutella.persist.getJsonStore('db/demo_quakes.json')


# Requests

# handle room configuration request
nutella.net.handle_requests('room_configuration') do |req|
  room_store.transaction { room_store.to_h }
end

# handle quakes schedule request
nutella.net.handle_requests('quakes_schedule') do |req|
  rq_mode = room_store.transaction { room_store['rq_mode'] }
  rq_mode == 'schedule' ?  quakes_store.transaction { quakes_store.to_h } : demo_quakes_store.transaction { demo_quakes_store.to_h }
end


# Updates / Subscriptions

# handle room configuration updates
nutella.net.subscribe('room_config_update', lambda do |m|
  m.delete 'from'
  room_store.transaction { room_store.merge! m }
end)

# handle mode switch
nutella.net.subscribe('mode_update', lambda do |m|
  room_store.transaction { room_store['rq_mode'] = m['rq_mode'] }
end)

# handle new demo quakes
nutella.net.subscribe('new_demo_quake', lambda do |m|
  m.delete 'from'
  demo_quakes_store.transaction {
    demo_quakes_store['quakes_schedule'] = Array.new if demo_quakes_store['quakes_schedule'].nil?
    demo_quakes_store['quakes_schedule'].push(m)
  }
end)

# handle clear demo quakes
nutella.net.subscribe('demo_quakes_clean', lambda do |m|
  demo_quakes_store.transaction {
    demo_quakes_store['quakes_schedule'] = Array.new
  }
end)

# handle quakes schedule updates
nutella.net.subscribe('quakes_schedule_update', lambda do |m|
  m.delete 'from'
  quakes_store.transaction {
    quakes_store['quakes_schedule'] = m['quakes_schedule']
  }
end)


# Just sit there waiting for messages to come
nutella.net.listen
