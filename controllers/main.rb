get '/' do
	list = {}
	
	list['bar'] = 'foo'

	erb :'index/index', :locals => list
end