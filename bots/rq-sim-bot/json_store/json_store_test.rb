require_relative 'json_store'

store = JSONStore.new("json_test.json")

# Write
store.transaction { store["key"]="value" }

# Read
value = store.transaction { store["key"] }
puts value # prints "value"

# Dump the store
hash = store.transaction { store.to_h }
p hash # prints {"key" => "value"}


