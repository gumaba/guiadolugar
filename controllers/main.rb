before '*' do
  # BR só é BR com gambiarra :P
  request.class.module_eval {
    attr_accessor :book
  }
  request.book = Book.new(request)
  request.book.write('search_letters', ['#'] + Array('a'..'z'))
end

after '*' do

end


get '/' do
  list = {}
  list['bar'] = 'foo'
  tome 'index/index', list
end
