#
# Copyright (C) 2017 ThatNameGroup, LLC. and Al Piepho
#               All Rights Reserved
#
require 'optparse'
require 'ostruct'
require 'watir'

require './test_random.rb'

# TODO - could nokogiri help speed up testing?

###########################################################
# CONSTANTS and GLOBAL VARIABLES
###########################################################
APP_VERSION = "0.1"

DEFAULT_RANDOM_CNT = 100

# export PATH=$PATH:/Users/Al/.chromedriver
#url = "file:///Users/Al/Projects/freecodecamp/project-tic-tac-toe/index.html"
#time ruby test_tictactoe.rb --url "file:///Users/Al/Projects/freecodecamp/project-tic-tac-toe/index.html" -c 10000

###########################################################
# program OPTIONS
###########################################################
$options = OpenStruct.new
$options.seed = Random.new_seed
$options.cnt = DEFAULT_RANDOM_CNT
parser = OptionParser.new do |opt|
    opt.on('-u', '--url <url>',  'url to web app')                  { |o| $options.url     = o      }
    opt.on('-s', '--seed <num>', '(optional) randon seed)')         { |o| $options.seed    = o.to_i }
    opt.on('-c', '--count <num>','(optional) random count (games)') { |o| $options.cnt     = o.to_i }
    opt.on('-D', '--Debug',      'debug mode, force hang at end')   { |o| $options.debug   = true   }
    opt.on('-v', '--Version',    'show the current version.')       { |o| $options.version = true   }
end
parser.parse!

if $options.version
    puts "test_tictactoe: version %s" % APP_VERSION
    exit
end
if $options.url.nil?
    puts "WARNING: please provide a url"
    exit
end

def forceHang
  puts "WARNING: forcing hang!!! (use 'right-click-inspect' in Chrome to debug)"
  while true
    sleep(10)
  end
end

###########################################################
# BROWSER support
###########################################################
def click(id)
  $browser.button(:id => id).click
end

def clickSpan(id)
  $browser.span(:id => id).click
end

def getStatStr(id)
  val = $browser.div(:id => id).text
  val
end

###########################################################
# ASSERT support
###########################################################
def assertResultVal(id, expected)
  # given expected int, convert to string
  # and compare vs string at id
  str = resultValueStr(id)
  expected = "%08X" % expected if     $fmtHex
  expected = "%d"   % expected if not $fmtHex
  expected = expected.gsub(".", "F") # HACK don't know why getting ..FFFF32 instead of FFFFFF32
  puts "  DEBUG: result '%s'   expected '%s'" % [str, expected] if $options.debug
  if not expected.eql?(str)
    puts "ERROR: result '%s' != expected '%s'" % [str, expected]
    forceHang
  end
end

def assertResultEmp(id)
  # given expected string
  # compare vs string at id
  str = resultValueStr(id)
  puts "  DEBUG: result '%s'" % [str] if $options.debug
  if not str.nil? and str.length > 0
    puts "ERROR: result '%s' not empty" % [str]
    forceHang
  end
end

###########################################################
# MAIN
###########################################################
$browser = Watir::Browser.new(:chrome)
$browser.window.resize_to(900, 800)
#$browser.window.move_to(400, 0)
$browser.goto($options.url)

# TESTS
test_Random

# DEBUG optional force hang
if $options.debug
  puts "  DEBUG: force hang"
  forceHang
end
