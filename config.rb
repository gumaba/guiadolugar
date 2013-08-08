class Hash
  def dig(dotted_path)
    parts = dotted_path.split '.', 2
    match = self[parts[0]]
    if !parts[1] or match.nil?
      return match
    else
      return match.dig(parts[1])
    end
  end
end

class Configure
	@@configuration = {}
	def self.get(name)
		return @@configuration.dig(name)
	end
	def self.set(name, value)
		@@configuration[name] = value
	end
end