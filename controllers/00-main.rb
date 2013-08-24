$db = Mongo::Connection.new("localhost", 27017).db("guiadolugar")

before '*' do
	# BR só é BR com gambiarra :P
	request.class.module_eval {
		attr_accessor :book
	}
	request.book = Book.new(request, session)
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

post '/login' do
	h = Digest::SHA2.new << params[:password]
	check = $db.collection('users').find(:email => params[:email], :password => h.to_s).to_a
	if check.length > 0 then
		session['user'] = check[0]
		redirect '/admin'
	else
		request.book.glossary('login_error', 'Erro ao validar suas credenciais, verifique-as e tente novamente.')
		tome 'login'
	end
end

after '*' do

end



