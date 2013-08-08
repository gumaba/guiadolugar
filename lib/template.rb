require 'erb'
require 'ostruct'

class ErbalT < OpenStruct
  def render(template)
    ERB.new(template).result(binding)
  end
end


class Template
	attr_accessor :template_name
	attr_accessor :view_path
	attr_accessor :vars
	
	def initialize(tpl)
		@vars = {
			'bar' => 'foo'
		}
		@view_path = "views/"
		@template_name = tpl
	end

	def render()
		engine = ErbalT.new(vars)
		return engine.render(File.read(@view_path + @template_name))
	end
end