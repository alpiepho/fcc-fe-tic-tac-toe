#
# Copyright (C) 2017 ThatNameGroup, LLC. and Al Piepho
#               All Rights Reserved
#
require 'optparse'
require 'ostruct'
require 'watir'

###########################################################
# CONSTANTS and GLOBAL VARIABLES
###########################################################
APP_VERSION = "0.1"

DEFAULT_RANDOM_CNT = 100

# BELOW - app specfic variables and functions
# for my codepen: https://codepen.io/sd3x/full/RVqxZz
GAMES_RATE   = 10
STAT_ID      = "gstat"
STAT_INPLAY  = "game in progess..."
STAT_WINX    = "X wins!!!"
STAT_WINO    = "0 wins!!!"
STAT_DRAW    = "draw"
$allIds      = [
  "c0", "c1", "c2",
  "c3", "c4", "c5",
  "c6", "c7", "c8"
]

def startSequence()
  click("b7")  # clear
  click("b1")  # _X_
  click("b3")  # _1_
  click("b5")  # _on__
  click("b9")  # _1st_
end

def clearSequence()
  click("b7")  # clear
end

def clickPlay(id)
  clickSpan(id)
end
# ABOVE - app specfic variables and functions

'''
# BELOW - app specfic variables and functions
# for example codepen: https://codepen.io/freeCodeCamp/full/KzXQgy
GAMES_RATE   = 10
STAT_ID      = "gstat"
STAT_INPLAY  = "game in progess..."
STAT_WINX    = "X wins!!!"
STAT_WINO    = "0 wins!!!"
STAT_DRAW    = "draw"
$allIds      = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9"
]

def startSequence()
  clickButtonClass("one-player")
  clickButtonClass("choose-x")
end

def clearSequence()
  clickButtonClass("hard-reset")
  clickButtonClass("one-player")
  clickButtonClass("choose-x")
end

def clickPlay(id)
  # TODO stuck here
  puts id
  clickIClass(id)
end
# ABOVE - app specfic variables and functions
'''

###########################################################
# TEST - random
###########################################################
def test_Random
  puts "SUITE: test_Random"

  puts "  INFO: using seed         : %d" % $options.seed
  puts "  INFO: total count (games): %d" % $options.cnt


  max = $allIds.length - 1
  prng = Random.new($options.seed)

  startSequence()
  wins  = 0
  draws = 0
  for i in 0..$options.cnt-1
    clearSequence()
    saved = []
    while (getStatStr(STAT_ID).include?(STAT_INPLAY))
      id = $allIds[ prng.rand(0..max) ]
      next if saved.include? id # optimize
      saved << id
      clickPlay(id)
    end
    # progress
    puts "games: %d..." % i if (i> 0 && i%GAMES_RATE == 0)
    wins  += 1               if (getStatStr(STAT_ID).include?(STAT_WINO))
    draws += 1               if (getStatStr(STAT_ID).include?(STAT_DRAW))
    # error check
    if (getStatStr(STAT_ID).include?(STAT_WINX))
      puts "games: %d" % i
      puts "ERROR: unexpected \"%s\"" % STAT_WINX
      puts saved
      return
    end
  end
  puts "games: %d" % $options.cnt
  puts "wins : %d" % wins
  puts "draws: %d" % draws
  puts "  INFO: assume if we got here the test passed"
end



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
    opt.on('-h', '--Help',       'show the help.')                  { |o| $options.help    = true   }
end
parser.parse!

if $options.help
  puts "
  This Ruby/Watir/Selenium test can test the Free Code Camp
  project Tic Tac Toe.  It will require a little setup and
  some minor modifications of this script.

  - assume you are using Chrome
  - assume you have ruby installed
  - install watir gem
  - download chromedriver for your system and unzip (I used <user>/.chromedriver)
  - update path to chromedriver (export PATH=$PATH:<path to chrome driver>)
  - modifiy local copy of this script, see 'app specific'
  - use chrome inspector to find id's from modifications
  - issue command like:
     ruby test_tictactoe.rb --url <some url> -c <games count>

  It might take a few iterations.
  "
  exit
end

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

# detect if testing codepen, need to access iframe in that case
if $options.url.include?("codepen.io")
  $options.codepen = true
end

###########################################################
# BROWSER support
###########################################################
def click(id)
  $browser.button(:id => id).wait_until_present.click                        if !$options.codepen
  $browser.iframe(:id, "result").button(:id => id).click  if $options.codepen
end

def clickSpan(id)
  $browser.span(:id => id).click                           if !$options.codepen
  $browser.iframe(:id, "result").span(:id => id).click     if $options.codepen
end

def clickButtonClass(id)
  $browser.button(:class => id).wait_until_present.click                        if !$options.codepen
  $browser.iframe(:id, "result").button(:class => id).wait_until_present.click  if $options.codepen
end

def clickIClass(id)
  $browser.i(:class => id).wait_until_present.click                        if !$options.codepen
  $browser.iframe(:id, "result").i(:class => id).wait_until_present.click  if $options.codepen
end

def getStatStr(id)
  val = $browser.div(:id => id).text                       if !$options.codepen
  val = $browser.iframe(:id, "result").div(:id => id).text if $options.codepen
  val
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
