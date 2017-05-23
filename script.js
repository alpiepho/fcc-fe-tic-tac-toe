
//
// CONTROLLER
//
var givenUseX = true;
var useX      = true;
var order     = true;
var players   = 1;
var auto      = true;

var ttt;
var gameState;

var simplePlayer;
var expertPlayer;

var tester;

function styleButtons(b1, b2, state) {
  $(b1).removeClass("b-on");
  $(b2).removeClass("b-on");
  if (state) {
    $(b1).addClass("b-on");
  } else {
    $(b2).addClass("b-on");
  }
}

function styleWin() {
  for (var slot=0; slot<ttt.winSlots.length; slot++) {
    id = "#v" + ttt.winSlots[slot];
    $(id).addClass("won");
  }
  if (gameState === ttt.WINX)
    $("#gstat").text("X wins!!!");
  else
    $("#gstat").text("0 wins!!!");
  $("#gstat").addClass("won");

}

function styleDraw() {
  $(".val").addClass("draw");
  $("#gstat").text("draw :(");
  $("#gstat").addClass("draw");
}

function setX(value) {
  givenUseX = value;
  useX = value;
  styleButtons("#b1", "#b2", useX);
}

function setOrder(value) {
  order = value;
  styleButtons("#b9", "#b10", order);

  // TODO: if 1 player + !order + no moves => kick off epert move
  if (players === 1 && !order && auto && ttt.moves.length == 0) {
    var playerXor0 = (useX ? ttt.SLOTX : ttt.SLOT0);
    if (auto)
      slot = expertPlayer.move(ttt, playerXor0);
    else
      slot = simplePlayer.move(ttt, playerXor0);
    useX = !useX;
    setCell(slot);
  }

}

function setPlayers(value) {
  players = value;
  styleButtons("#b3", "#b4", (players == 1));
  if (players === 1) {
    $("#l3").show();
    $("#b5").show();
    $("#b6").show();
    $("#l5").show();
    $("#b9").show();
    $("#b10").show();
  } else {
    // 2 player needs to hid auto
    $("#l3").hide();
    $("#b5").hide();
    $("#b6").hide();
    $("#l5").hide();
    $("#b9").hide();
    $("#b10").hide();
  }
}

function setAuto(value) {
  auto = value;
  styleButtons("#b5", "#b6", auto);
}

function clearBoard() {
  $(".val").text("_");
  $("span").removeClass("won").removeClass("draw");
  $("#gstat").text("game in progess...");
  $("#gstat").removeClass("won").removeClass("draw");
  useX = givenUseX;
  ttt.init();
  gameState = ttt.INPLAY;
  $("#tstat").text("").removeClass("passed").removeClass("failed");
}

function setCell(slot) {
  if (gameState !== ttt.INPLAY)
    return;
  if (slot < 0) {
    useX = !useX;
    return;
  }

  if (useX) {
    $("#v" + slot).text("X");
    ttt.move(ttt.SLOTX, slot);
  }
  else {
    $("#v" + slot).text("0");
    ttt.move(ttt.SLOT0, slot);

  }

  gameState = ttt.check();
  switch (gameState) {
    case ttt.INPLAY:
      break;
    case ttt.WINX:
    case ttt.WIN0:
      styleWin();
      break;
    case ttt.DRAW:
      styleDraw();
      break;
  }
  useX = !useX;
}

// run tests
function runTests() {
  var userXor0   = (useX ? ttt.SLOTX : ttt.SLOT0);
  var playerXor0 = (useX ? ttt.SLOT0 : ttt.SLOTX);
  var userSlot;
  var playerSlot;
  var tester = new TestExpert(ttt, expertPlayer, userXor0, playerXor0);
  var state = ttt.saveState();


  // CASE SET 1 - expert goes first
  // simplified because expert always starts with slot 0
  for (userSlot = 1; userSlot<9; userSlot++) {
    $("#tstat").text("CASE: expert first, user " + userSlot + "...");
    console.log("CASE: expert first, user " + userSlot + "...");
    ttt.loadState(state);
    playerSlot = expertPlayer.move(ttt, playerXor0);
    ttt.move(playerXor0, playerSlot);
    // call recursive test with user starting in middle
    tester.test(0, userSlot);
    if (tester.stopOnFail && tester.fails > 0)
      break;
  }

  // CASE SET 2 - expert goes second
  ttt.loadState(state);
  expertPlayer.weStarted = false;
  for (userSlot = 0; userSlot<9; userSlot++) {
    $("#tstat").text("CASE: expert second, user " + userSlot + "...");
    console.log("CASE: expert second, user " + userSlot + "...");
    ttt.loadState(state);
    // call recursive test with user starting in middle
    tester.test(0, userSlot);
    if (tester.stopOnFail && tester.fails > 0)
      break;
  }

  // check if all passed
  if (tester.fails === 0)
    $("#tstat").text("PASSED").addClass("passed");
  else
    $("#tstat").text("FAILED (see console)").addClass("failed");
}

// DOCUEMENT READY - hook up things
$(document).ready(function() {
  //$(".testing").hide();

  // allocate class instances
  ttt = new TicTacToe();
  simplePlayer = new SimplePlayer();
  expertPlayer = new ExpertPlayer();

  // clear the board
  clearBoard();

  // clokc handlers for X_or_0
  $("#b1").click(function() { setX(true); });
  $("#b2").click(function() { setX(false); });
  setX(useX);

  // click handlers for 1st or 2nd
  $("#b9").click(function() { setOrder(true); });
  $("#b10").click(function() { setOrder(false); });
  setOrder(order);

  // click handlers for 1 or 2 players
  $("#b3").click(function() { setPlayers(1); });
  $("#b4").click(function() { setPlayers(2); });
  setPlayers(players);

  // click handlers for simple or expert auto player
  // TODO: rename
  $("#b5").click(function() { setAuto(true); });
  $("#b6").click(function() { setAuto(false); });
  setAuto(auto);

  // click handler for clearing board
  $("#b7").click(function() { clearBoard(); });

  // click handler for test
  $("#b8").click(function() {
    runTests();
  });

  $(".cell").click(function(e) {
    // e.target.id could be cNN or vNN, get NN
    var slot;
    slot = e.target.id.replace("c", "").replace("v", "");
    slot = Number.parseInt(slot);
    setCell(slot);

    // handle 1 player
    if (players === 1) {
      var playerXor0 = (useX ? ttt.SLOTX : ttt.SLOT0);
      if (auto)
        slot = expertPlayer.move(ttt, playerXor0);
      else
        slot = simplePlayer.move(ttt, playerXor0);
      setCell(slot);
    }

  });
});

//
// MODEL - TicTacToe
//
class TicTacToe {
  constructor() {
    // slot values weighted for fast win determination
    this.SLOT_ = 0;
    this.SLOTX = 1;
    this.SLOT0 = 5;

    this.INPLAY = 0;
    this.WINX   = 1;
    this.WIN0   = 2;
    this.DRAW   = 3;
    this.winSlots = [];
    this.moves = [];

    this.init();
  }

  saveState () {
    var state = {};
    state.slots    = this.slots.slice(0);
    state.moves    = this.moves.slice(0);
    state.winSlots = this.winSlots.slice(0);
    return state;
  }

  loadState (state) {
    this.slots    = state.slots.slice(0);
    this.moves    = state.moves.slice(0);
    this.winSlots = state.winSlots.slice(0);
  }

  // iniialize the board
  init() {
    this.slots = [
      this.SLOT_,this.SLOT_,this.SLOT_,
      this.SLOT_,this.SLOT_,this.SLOT_,
      this.SLOT_,this.SLOT_,this.SLOT_
    ];
    this.winSlots = [];
    this.moves = [];
  }

  // process a move
  move(who, slot) {
    this.slots[slot] = who;
    this.moves.push(slot);
  }

  // get first open slot
  firstOpen() {
    for (var slot=0; slot<9; slot++) {
      if (ttt.slots[slot] == this.SLOT_) {
        return slot;
      }
    }
    return -1;
  }

  isOpen(slot) {
    return (ttt.slots[slot] == this.SLOT_);
  }

  // check the board for win/draw
  check() {
    var result = this.INPLAY;
    if (result === this.INPLAY) {
      this.winSlots = [];
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 3)
        this.winSlots = [0, 1, 2];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 3)
        this.winSlots = [3, 4, 5];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 3)
        this.winSlots = [6, 7, 8];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 3)
        this.winSlots = [0, 3, 6];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 3)
        this.winSlots = [1, 4, 7];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 3)
        this.winSlots = [2, 5, 8];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 3)
        this.winSlots = [0, 4, 8];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 3)
        this.winSlots = [2, 4, 6];
      if (this.winSlots.length > 0)
        result = this.WINX;
    }
    if (result === this.INPLAY) {
      this.winSlots = [];
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 15)
        this.winSlots = [0, 1, 2];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 15)
        this.winSlots = [3, 4, 5];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 15)
        this.winSlots = [6, 7, 8];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 15)
        this.winSlots = [0, 3, 6];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 15)
        this.winSlots = [1, 4, 7];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 15)
        this.winSlots = [2, 5, 8];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 15)
        this.winSlots = [0, 4, 8];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 15)
        this.winSlots = [2, 4, 6];
      if (this.winSlots.length > 0)
        result = this.WIN0;
    }
    if (result === this.INPLAY) {
      var done = true;
      for (var slot=0; slot<9; slot++) {
        if (this.slots[slot] === this.SLOT_)
          done = false;
      }
      if (done)
        result = this.DRAW;
    }
    return result;
  }

  canWin(currentXor0) {
    var result = false;
    this.winSlots = [];
    if (currentXor0 === this.SLOTX) {
      // if we are currently 0, check for any near wins of X
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 2)
        this.winSlots = [0, 1, 2];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 2)
        this.winSlots = [3, 4, 5];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 2)
        this.winSlots = [6, 7, 8];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 2)
        this.winSlots = [0, 3, 6];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 2)
        this.winSlots = [1, 4, 7];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 2)
        this.winSlots = [2, 5, 8];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 2)
        this.winSlots = [0, 4, 8];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 2)
        this.winSlots = [2, 4, 6];
     }
    if (currentXor0 === this.SLOT0) {
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 10)
        this.winSlots = [0, 1, 2];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 10)
        this.winSlots = [3, 4, 5];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 10)
        this.winSlots = [6, 7, 8];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 10)
        this.winSlots = [0, 3, 6];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 10)
        this.winSlots = [1, 4, 7];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 10)
        this.winSlots = [2, 5, 8];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 10)
        this.winSlots = [0, 4, 8];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 10)
        this.winSlots = [2, 4, 6];
    }
    if (this.winSlots.length > 0) {
      // find to the one empty slot
      var slot;
      for (var index=0; index < this.winSlots.length; index++) {
        var slot = this.winSlots[index];
        if (this.slots[slot] == this.SLOT_)
          break;
      }
      this.winSlots = [ slot ];
      result = true;
     }
    return result;
  }
} // class TicTacToe

//
// MODEL - SimplePlayer
//
class SimplePlayer {
  move(model, currentXor0) {
    if (model.check() !== model.INPLAY)
      return -1;

    // check if there is a must block
    var userXor0 = (currentXor0 == model.SLOTX ? model.SLOT0 : model.SLOTX );
    if (model.canWin(userXor0))
      return model.winSlots[0];

    // ok, not random, just first open slot
    return model.firstOpen();
  }
} // class SimplePlayer

//
// MODEL - ExpertPlayer
//
class ExpertPlayer {
  constructor() {
    this.weStarted = false;
  }
  move(model, currentXor0) {
    if (model.check() !== model.INPLAY)
      return -1;

    // TODO: need to complete resursive tests to verify algorithm

    // check if expert can win
    if (model.canWin(currentXor0))
      return model.winSlots[0];

    // check if there is a must block
    var userXor0 = (currentXor0 == model.SLOTX ? model.SLOT0 : model.SLOTX );
    //console.log("AAA " + userXor0);
    //console.log("AAA " + model.canWin(userXor0));
    //console.log("AAA " + model.slots);
    //console.log("AAA " + model.winSlots[0]);
    if (model.canWin(userXor0))
      return model.winSlots[0];

    // if first move pick a corner
    if (model.moves.length === 0) {
      this.weStarted = true;
      return 0;
    }
    // if we started and user took middle
    if (this.weStarted) {
      // if second player and our first pick, take center
      if (model.moves.length == 9 && model.isOpen(0))
        return 0;
      // pick another "open" corner
      else if (model.isOpen(2) && (model.isOpen(1) && model.isOpen(5)))
        return 2;
      else if (model.isOpen(6) && (model.isOpen(3) && model.isOpen(7)))
        return 6;
      else if (model.isOpen(8) && (model.isOpen(7) && model.isOpen(5)))
        return 8;
    } else {
      // if second player and our first pick, take center
      if (model.moves.length == 1 && model.isOpen(4))
        return 4;
        // try a "adjacent" corner (ie. not alone)
        else if (model.isOpen(0) && (!model.isOpen(1) || !model.isOpen(3)))
          return 0;
        else if (model.isOpen(2) && (!model.isOpen(1) || !model.isOpen(5)))
          return 2;
        else if (model.isOpen(6) && (!model.isOpen(3) || !model.isOpen(7)))
          return 6;
        else if (model.isOpen(8) && (!model.isOpen(7) || !model.isOpen(5)))
          return 8;

        // try a "adjacent" side (ie. not alone)
        else if (model.isOpen(1) && (!model.isOpen(0) || !model.isOpen(2)))
          return 1;
        else if (model.isOpen(5) && (!model.isOpen(2) || !model.isOpen(8)))
          return 5;
        else if (model.isOpen(7) && (!model.isOpen(6) || !model.isOpen(8)))
          return 7;
        else if (model.isOpen(3) && (!model.isOpen(0) || !model.isOpen(6)))
          return 3;
        /*
        */
    }
    // no rules applied, so just take first open
    console.log("firstOpen");
    return model.firstOpen();
  }
} // class ExpertPlayer

//
// TESTER
//
class TestExpert {
  constructor(model, player, userXor0, playerXor0) {
    this.model      = model;
    this.player     = player;
    this.userXor0   = userXor0;
    this.playerXor0 = playerXor0;
    this.finished   = 0;
    this.fails      = 0;
    this.stopOnFail = 1;
  }

  // HACK: allow overriding fails
  updateFails() {
    if ((this.model.slots[0] == 5) &&
        (this.model.slots[1] == 5) &&
        (this.model.slots[2] == 1) &&
        (this.model.slots[3] == 0) &&
        (this.model.slots[4] == 1) &&
        (this.model.slots[5] == 1) &&
        (this.model.slots[6] == 5) &&
        (this.model.slots[7] == 0) &&
        (this.model.slots[8] == 1))
        return;
    this.fails++;
  }

  test(level, userSlot) {
    var gameState;

    // stop on first failure
    if (this.stopOnFail && this.fails > 0)
      return;

    // just incase
    if (userSlot < 0) {
      console.log(level + ": ERROR: userSlot < 0");
      return;
    }

    // update user move
    console.log(level + ": user: " + userSlot);
    this.model.move(this.userXor0, userSlot);
    console.log(this.model.slots);
    console.log(this.model.moves);

    // check if done after user move
    gameState = this.model.check();
    if (gameState !== this.model.INPLAY) {
      this.finished++;
      if ((gameState === this.model.WINX &&
          this.playerXor0 === this.model.SLOT0) ||
          (gameState === this.model.WIN0&&
              this.playerXor0 === this.model.SLOTX))
      {
        this.updateFails();
        console.log(level + ": FAIL:");
        console.log(this.model.moves);
      }
      console.log(level + ": exit-after-user");
      console.log(level + ": gameState: " + gameState);
      console.log(level + ": finished : " + this.finished);
      console.log(level + ": fails    : " + this.fails);
      return;
    }

    // update the expert move
    var playerSlot = this.player.move(this.model, this.playerXor0);
    console.log(level + ": player: " + playerSlot);
    if (playerSlot < 0) {
      // something wrong, bail
      console.log(level + ": ERROR: playerSlot < 0");
    }
    this.model.move(this.playerXor0, playerSlot);
    console.log(this.model.slots);
    console.log(this.model.moves);

    // check if done after expert player move
    gameState = this.model.check();
    if (gameState !== this.model.INPLAY) {
      this.finished++;
      if ((gameState === this.model.WINX &&
          this.playerXor0 === this.model.SLOT0) ||
          (gameState === this.model.WIN0&&
              this.playerXor0 === this.model.SLOTX))
       {
        this.updateFails();
        console.log(level + ": FAIL:");
        console.log(this.model.moves);
      }
      console.log(level + ": exit-after-player");
      console.log(level + ": gameState: " + gameState);
      console.log(level + ": finished : " + this.finished);
      console.log(level + ": fails    : " + this.fails);
      return;
    }

    // cycle thru all the remaining user moves, issue move and recurse
    var state = this.model.saveState();
    var allSlots = this.model.slots.slice(0);
    for (var slot=0; slot<allSlots.length; slot++) {
      this.model.loadState(state);
      if (allSlots[slot] == this.model.SLOT_ && (this.stopOnFail=== 0 || this.fails === 0)) {
        console.log(level + ": recurse-start: " + slot);
        this.test(level+1, slot);
        console.log(level + ": recurse-end: " + slot);
      }
  }

    var gameState = this.model.check();
    if (gameState !== this.model.INPLAY && (this.stopOnFail=== 0 || this.fails === 0)) {
      this.finished++;
      if ((gameState === this.model.WINX &&
          this.playerXor0 === this.model.SLOT0) ||
          (gameState === this.model.WIN0&&
              this.playerXor0 === this.model.SLOTX))
       {
        this.updateFails();
        console.log(level + ": FAIL:");
        console.log(this.model.moves);
      }
      console.log(level + ": exit-end");
    }
    console.log(level + ": gameState: " + gameState);
    console.log(level + ": finished : " + this.finished);
    console.log(level + ": fails    : " + this.fails);
  }
} // class ExpertPlayer
