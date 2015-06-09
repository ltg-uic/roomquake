require 'nutella_lib'

# Parse command line arguments
broker, app_id, run_id = nutella.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.init(broker, app_id, run_id, component_id)


# Initialize storage
room_store = nutella.persist.get_json_object_store('room_config')
quakes_store = nutella.persist.get_json_object_store('quakes_schedule')
demo_quakes_store = nutella.persist.get_json_object_store('demo_quakes')


# Requests

# handle room configuration request
nutella.net.handle_requests('room_configuration', lambda do |req, from|
  room_store.to_h
end)

# handle quakes schedule request
nutella.net.handle_requests('quakes_schedule', lambda do |req, from|
  rq_mode = room_store['rq_mode']
  rq_mode == 'schedule' ?  quakes_store.to_h : demo_quakes_store.to_h
end)

# handle quakes series exlclusively
nutella.net.handle_requests('quakes_series', lambda do |req, from|
  quakes_store.to_h
end)



# Updates / Subscriptions

# handle room configuration updates
nutella.net.subscribe('room_config_update', lambda do |m, f|
  room_store.merge! m
end)

# handle mode switch
nutella.net.subscribe('mode_update', lambda do |m, f|
  room_store['rq_mode'] = m['rq_mode']
end)

# handle new demo quakes
nutella.net.subscribe('new_demo_quake', lambda do |m, f|
  demo_quakes_store['quakes_schedule'] = Array.new if demo_quakes_store['quakes_schedule'].nil?
  demo_quakes_store['quakes_schedule'] = demo_quakes_store['quakes_schedule'].push(m)
end)

# handle clear demo quakes
nutella.net.subscribe('demo_quakes_clean', lambda do |m, f|
  demo_quakes_store['quakes_schedule'] = Array.new
end)

# handle quakes schedule updates
nutella.net.subscribe('quakes_schedule_update', lambda do |m, f|
  quakes_store['quakes_schedule'] = m['quakes_schedule']
end)

# handle updates of current quake
nutella.net.subscribe('set_current_quake', lambda do |m, f|
  room_store['current_quake_id'] = m['current_quake_id']
  room_store['current_quake_time'] = m['current_quake_time']
end)


puts 'RQ Backend bot listening'

# Just sit there waiting for messages to come
nutella.net.listen
