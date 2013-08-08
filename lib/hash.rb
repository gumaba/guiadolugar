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

class Array
  def dig(dotted_path)
    parts = dotted_path.split '.', 2
    match = self[parts[0].to_i()]
    if !parts[1] or match.nil?
      return match
    else
      return match.dig(parts[1])
    end
  end
end