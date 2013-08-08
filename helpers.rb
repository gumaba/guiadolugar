helpers do
	def link_to(url,text=url,opts={},full=false)
	  attributes = ""
	  opts.each { |key,value| attributes << key.to_s << "=\"" << value << "\" "}
	  url = self.url_to(url, full)
	  "<a href=\"#{url}\" #{attributes}>#{text}</a>"
	end
	def url_to(relative_url, full=false)
		if full
			return relative_url =~ /^(http|ftp)/ ? relative_url : "#{request.base_url}/#{relative_url}"
		else
			return relative_url =~ /^(http|ftp)/ ? relative_url : "#{relative_url}"
		end
	end
	def assets(type, file)
		minified = ''
		if Configure::get('env') == "production"
			minified = '.min'
		end
		case type
			when 'css'
				return '' << Configure::get('Path.css') << '/' << file << minified << ".css"
			when 'js'
				return '' << Configure::get('Path.js') << '/' << file << minified << ".js"
		end
	end
end
