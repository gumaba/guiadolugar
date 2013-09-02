class Book
	attr_accessor :letters
	attr_accessor :sesion
	attr_accessor :request
	def initialize(request, session)
		if not session.has_key?('book') then
			session['book'] = {}
		end
		@session = session
		@request = request
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

	def glossary(word, meaning)
		@session['book'][word] = meaning
	end

	def glossary?(word)
		return @session['book'].has_key?(word)
	end

	def glossary!(word)
		if glossary?(word) then
			meaning = @session['book'][word]
			@session['book'].delete(word)
			return meaning
		end
	end

	def self.burn()
		#@@letters.delete($request.__id__.to_s)
	end
end


def tome(paper, letters = {})
	erb paper.to_sym, :locals => letters.merge(request.book.read())
end

Configure::set('name', 'Guia')
Configure::set('company_name', 'Guia do Lugar')
Configure::set('env', 'development')
Configure::set('Path', {
	'css' => 'css',
	'js' => 'js',
	'img' => 'img',
})

def logged(&block)
	if not block_given? then
		return session.has_key?('user')
	else
		ret = yield(session['user'])
		return ret
	end
end

def has_perm?(perm)
	return true
end
