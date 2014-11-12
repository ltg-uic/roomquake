#
# JSONStore
#
require 'json'
require 'pstore'

# JSONStore provides the same functionality as PStore, except it uses JSON
# to dump objects instead of Marshal.
class JSONStore < PStore

  def dump(table)
    table.to_json
  end

  def load(content)
    JSON.parse(content)
  end

  # Dumps the whole store to hash
  # example:
  # store = JSONStore.new("my_file.json")
  # hash = store.transaction { store.to_h }
  def to_h
    @table
  end

  def marshal_dump_supports_canonical_option?
    false
  end

  EMPTY_MARSHAL_DATA = {}.to_json
  EMPTY_MARSHAL_CHECKSUM = Digest::MD5.digest(EMPTY_MARSHAL_DATA)
  def empty_marshal_data
    EMPTY_MARSHAL_DATA
  end
  def empty_marshal_checksum
    EMPTY_MARSHAL_CHECKSUM
  end
end
