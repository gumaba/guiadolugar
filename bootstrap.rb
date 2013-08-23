class Book
  attr_accessor :letters
  def initialize(request)
    @letters = {}
  end

  def write(page, letters)
    @letters[page] = letters
  end

  def read(page='*')
    if page == '*' then
      return @letters
    else
      return @letters[page]
    end
  end

  def self.burn()
    #@@letters.delete($request.__id__.to_s)
  end
end


def tome(paper, letters = {})
  erb paper.to_sym, :locals => request.book.read()
end

Configure::set('name', 'Guia')
Configure::set('company_name', 'Guia do Lugar')
Configure::set('env', 'development')
Configure::set('Path', {
    'css' => 'css',
    'js' => 'js',
    'img' => 'img',
})

def logged
  return true
end

def has_perm?(perm)
	return true
end
