require 'nutella_lib'

# Initialize nutella
nutella.init ARGV

# Initialize storage
obs_store = nutella.persist.getJsonStore('db/observations.json')

# Requests

# handle observations requests
nutella.net.handle_requests('observations') do |req|
  obs_store.transaction { obs_store.to_h }
end


# Updates / Subscriptions

# handle new students observations
nutella.net.subscribe('new_observation', lambda do |m|
  m.delete 'from'
  obs_store.transaction do
    obs_store['observations'] = Array.new if obs_store['observations'].nil?
    obs_store['observations'].push(m)
  end
end)

# handle observations wiping
nutella.net.subscribe('wipe_observations', lambda do |m|
  obs_store.transaction do
    obs_store['observations'] = Array.new
  end
end)


# Just sit there waiting for messages to come
nutella.net.listen
