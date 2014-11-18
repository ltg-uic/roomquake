require 'nutella_lib'
require 'mongo'

include Mongo

# Init nutella
nutella.init ARGV

# Init DB
mongo_client = MongoClient.new('localhost', 27017)
db = mongo_client.db(nutella.run_id)
log = db.collection('log')
        
# Intercept all messages in the run and store them
nutella.net.subscribe('#', lambda do |message, channel|
  h = { 'channel' => channel, 'message' => message }
  log.insert(h)
end)

# Sits here and listens for messages
nutella.net.listen
