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

# TODO clean this up, maybe selectable from command line, and as classes
SITE = 0  # my site local
#SITE = 1  # my site on code pen
#SITE = 2  # example site on code pen

###########################################################
# SITE == 0 - my site local
###########################################################
if SITE == 0
  # BELOW - app specfic variables and functions
  URL = "file:///Users/Al/Projects/freecodecamp/project-tic-tac-toe/index.html"
  GAMES_RATE   = 10
  STAT_INPLAY  = "game in progess..."
  STAT_DRAW    = "draw"
  STAT_LOSE    = "0 wins!!!"
  STAT_WIN     = "X wins!!!"
  $allIds      = [
    "c0", "c1", "c2",
    "c3", "c4", "c5",
    "c6", "c7", "c8"
  ]

  def click(id)
    $browser.button(:id => id).wait_until_present.click
  end

  def clickSpan(id)
    $browser.span(:id => id).click
  end

  def getStatStr(id)
    val = $browser.div(:id => id).text
    val
  end

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

  def isMessage(msg)
    getStatStr("gstat").include?(msg)
  end

  def clickPlay(id)
    clickSpan(id)
  end
  # ABOVE - app specfic variables and functions
end

###########################################################
# SITE == 1 - my site on code pen
###########################################################
if SITE == 1
  # BELOW - app specfic variables and functions
  URL = "https://codepen.io/sd3x/full/RVqxZz"
  GAMES_RATE   = 10
  STAT_INPLAY  = "game in progess..."
  STAT_DRAW    = "draw"
  STAT_LOSE    = "0 wins!!!"
  STAT_WIN     = "X wins!!!"

  $allIds      = [
    "c0", "c1", "c2",
    "c3", "c4", "c5",
    "c6", "c7", "c8"
  ]

  def click(id)
    $browser.iframe(:id, "result").button(:id => id).wait_until_present.click
  end

  def clickSpan(id)
    $browser.iframe(:id, "result").span(:id => id).click
  end

  def getStatStr(id)
    val = $browser.iframe(:id, "result").div(:id => id).text
    val
  end

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

  def isMessage(msg)
    getStatStr("gstat").include?(msg)
  end

  def clickPlay(id)
    clickSpan(id)
  end
  # ABOVE - app specfic variables and functions
end


###########################################################
# SITE == 2 - example site on code pen
###########################################################
if SITE == 2
  # BELOW - app specfic variables and functions
  URL = "https://codepen.io/freeCodeCamp/full/KzXQgy"
  GAMES_RATE   = 10
  STAT_INPLAY  = "" # empty if in play
  STAT_DRAW    = "draw-message"
  STAT_LOSE    = "lose-message"
  STAT_WIN     = "win-message"
  $allIds      = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9"
  ]

  def clickB(id)
    sleep 1 # account for visual effects
    $browser.iframe(:id, "result").button(:class => id).wait_until_present.click
  end

  def clickI(id)
    sleep 1 # account for visual effects
    $browser.iframe(:id, "result").li(:class => id).i.wait_until_present.click
  end

  def isVisable(id)
    return $browser.iframe(:id, "result").div(:class => id).visible?
  end

  def startSequence()
    clickB("one-player")
    clickB("choose-x")
  end

  def clearSequence()
    clickB("hard-reset")
    clickB("one-player")
    clickB("choose-x")
  end

  def isMessage(msg)
    if (msg == STAT_INPLAY)
      return (not isVisable(STAT_DRAW)     \
              and not isVisable(STAT_LOSE) \
              and not isVisable(STAT_WIN))
    end
    return isVisable(msg)
  end

  def clickPlay(id)
    begin
      clickI(id)
    rescue
      # ignore errors about click going to another element
      # will happen when game is over
    end
  end
  # ABOVE - app specfic variables and functions
end

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
    while (isMessage(STAT_INPLAY))
      id = $allIds[ prng.rand(0..max) ]
      next if saved.include? id # optimize
      saved << id
      clickPlay(id)
    end
    # progress
    puts "games: %d..." % i if (i> 0 && i%GAMES_RATE == 0)
    wins  += 1               if (isMessage(STAT_LOSE))
    draws += 1               if (isMessage(STAT_DRAW))
    # error check
    if (isMessage(STAT_WIN))
      puts "games: %d" % i
      puts "ERROR: unexpected \"Win\" by user"
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
$options.url = URL
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
