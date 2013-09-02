require 'models/model';

class User < Model
  attr_accessor :name
  attr_accessor :email
  attr_accessor :password
  attr_accessor :last_login
  def after_load
    if @last_login then
      @last_login = Time.parse(@last_login, '%Y-%m-%dT%H:%M:%S%z')
    end
  end
end