class Book
	@@letters = {}
	def self.write(page, letters)
		@@letters[page] = letters
	end
	def self.read(page='*')
		if page == '*' then
			return @@letters
		else
			return @@letters[page]
		end
	end
end


def tome(paper, letters)
	erb paper.to_sym, :locals => Book.read().merge(letters)
end

Configure::set('name', 'Guia')
Configure::set('env', 'development')
Configure::set('Path', {
	'css' => 'css',
	'js' => 'js',
	'img' => 'img',
})
