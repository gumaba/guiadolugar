get '/admin' do
	logged do |user|
		tome 'admin/index'
	end
end
