before '*' do
	Book.write('search_letters', ['#'] + Array('a'..'z'))
end


get '/' do
	list = {}
	list['bar'] = 'foo'

	tome 'index/index', list
end
