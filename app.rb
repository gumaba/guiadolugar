$:.unshift('.')

require 'rubygems'
require 'sinatra'
require 'sinatra/contrib/all'
require 'mongo'

require 'helpers'
require 'config'
require 'bootstrap.rb'
require 'fileutils'
require 'lib/template'
require 'rack-session-file'


use Rack::Session::File, :storage => '/tmp/',
                           :expire_after => 1800

Dir.glob("controllers/*.rb").each { |r| require_relative r }
