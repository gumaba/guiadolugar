$db = Mongo::Connection.new("localhost", 27017).db("vivareal")

before '*' do
  # BR só é BR com gambiarra :P
  request.class.module_eval {
    attr_accessor :book
  }
  request.book = Book.new(request)
  request.book.write('search_letters', ['#'] + Array('a'..'z'))
end

before '/admin*' do
  if not logged then
    redirect '/restricted'
  end
end

get '/restricted' do
  'Ops, você precisa estar autorizado para acessar essa área. <a href="/login">Login</a>'
end

get '/login' do 
  tome 'login'
end

after '*' do

end



