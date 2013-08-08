$:.unshift('.')

require 'rubygems'
require 'sinatra'

require 'helpers'
require 'config'
require 'bootstrap.rb'
require 'fileutils'
require 'lib/template'

Dir.glob("controllers/*.rb").each { |r| require_relative r }
