require 'json'

get '/typeahead/cidades' do
  response = {:options => []}
  $db.collection('companies').find({}, {:fields => ['cidade']})
  response.to_json
end

get '/typeahead/estados' do
  response = {:options => []}
  $db.collection('companies').find({}, {:fields => ['estado']})
  response.to_json
end