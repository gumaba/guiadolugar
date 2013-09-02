class Model
  def initialize(arr=nil)
    if arr then
      arr.each { |name, value| instance_variable_set("@#{name}", value) }
      after_load()
    end
  end

  def after_load

  end
end