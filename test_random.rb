#
# Copyright (C) 2017 ThatNameGroup, LLC. and Al Piepho
#               All Rights Reserved
#

###########################################################
# TEST - random
###########################################################
def test_Random
  puts "SUITE: test_Random"

  puts "  INFO: using seed         : %d" % $options.seed
  puts "  INFO: total count (games): %d" % $options.cnt

  $allIds = [
    "c0", "c1", "c2",
    "c3", "c4", "c5",
    "c6", "c7", "c8"
  ]

  max = $allIds.length - 1
  prng = Random.new($options.seed)

  click("b7")  # clear
  click("b1")  # _X_
  click("b3")  # _1_
  click("b5")  # _on__
  click("b9")  # _1st_

  for i in 0..$options.cnt
    click("b7")  # clear
    saved = []
    while (getStatStr("gstat") == "game in progess...")
      id = $allIds[ prng.rand(0..max) ]
      # optimize
      next if saved.include? id
      saved << id
      clickSpan(id)
    end
    if (i> 0 && i%10 == 0)
      puts "iteration: %d" % i
    end
    if (getStatStr("gstat") == "X wins!!!")
      puts "iteration: %d" % i
      puts "ERROR: unexpected \"X wins!!!\""
      puts saved
      return
    end
  end

  puts "  INFO: assume if we got here the test passed"
end
