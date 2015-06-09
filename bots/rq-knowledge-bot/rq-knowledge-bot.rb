require 'nutella_lib'

# Parse command line arguments
broker, app_id, run_id = nutella.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.init(broker, app_id, run_id, component_id)


# Initialize storage
obs_store = nutella.persist.get_json_object_store('observations')


# Requests

# handle observations requests
nutella.net.handle_requests('observations', lambda do |req, from|
  obs_store.to_h
end)


# Updates / Subscriptions

# handle new students observations
nutella.net.subscribe('new_observation', lambda do |m, f|
  obs_store['observations'] = Array.new if obs_store['observations'].nil?
  obs_store['observations'] = obs_store['observations'].push(m)
end)

# handle observations wiping
nutella.net.subscribe('wipe_observations', lambda do |m, f|
  obs_store['observations'] = Array.new
end)


puts 'RQ Data bot listening'

# Just sit there waiting for messages to come
nutella.net.listen
