
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
    var userXor0   = (useX ? ttt.SLOTX : ttt.SLOT0);
    var playerXor0 = (useX ? ttt.SLOT0 : ttt.SLOTX);
    var tester = new TestExpert(ttt, expertPlayer, userXor0, playerXor0);

    $("#tstat").text("test expert first...");
    // expert goes first
    var playerSlot = expertPlayer.move(ttt, playerXor0);
    ttt.move(playerXor0, playerSlot);
    // call recursive test with user starting in middle
    if (tester.test(4))
      $("#tstat").text("PASSED").addClass("passed");
    else
      $("#tstat").text("FAILED").addClass("failed");
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
    state.slots    = this.slots;
    state.moves    = this.moves;
    state.winSlots = this.winSlots;
    return state;
  }

  loadState (state) {
    this.slots    = state.slots;
    this.moves    = state.moves;
    this.winSlots = state.winSlots;
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
    console.log(this.moves);
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

// MODEL - SimplePlayer
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

// MODEL - ExpertPlayer
class ExpertPlayer {
  constructor() {
    this.weStarted = false;
  }
  move(model, currentXor0) {
    if (model.check() !== model.INPLAY)
      return -1;

    // check if expert can win
    if (model.canWin(currentXor0))
      return model.winSlots[0];

    // check if there is a must block
    var userXor0 = (currentXor0 == model.SLOTX ? model.SLOT0 : model.SLOTX );
    if (model.canWin(userXor0))
      return model.winSlots[0];

    // TODO: add rules
    // if first move pick a corner
    if (model.moves.length === 0) {
      this.weStarted = true;
      return 0;
    }

    // if we started and user took middle
    if (this.weStarted && !model.isOpen(4)) {
      // pick another corner
      if (model.isOpen(2))
        return 2;
      else if (model.isOpen(6))
        return 6;
      else if (model.isOpen(8))
        return 8;
    } else {
      // try middle
      if (model.isOpen(4))
        return 4;
    }
    // no rules applied, so just take first open
    return model.firstOpen();
  }
} // class ExpertPlayer




// TESTER
class TestExpert {
  constructor(model, player, userXor0, playerXor0) {
    this.model      = model;
    this.player     = player;
    this.userXor0   = userXor0;
    this.playerXor0 = playerXor0;
  }
  test(userSlot) {
    var result = true;

    console.log("gameState: " + this.model.check());
    if (this.model.check() !== this.model.INPLAY)
      return false;
    if (userSlot < 0)
      return false;

    // update user move
    this.model.move(this.userXor0, userSlot);

    // update the expert move
    var playerSlot = this.player.move(this.model, this.playerXor0);
    this.model.move(this.playerXor0, playerSlot);
    console.log(playerSlot);

    // cycle thru all the remaining user moves, issue move and recurse
    var state = this.model.saveState();
    for (var index=0; index<this.model.slots.length; index++) {
      this.model.loadState(state);
      var userSlot = this.model.slots[index];
      if (userSlot == this.model.SLOT_)
        this.test(userSlot);
    }

    // check that user didn't win

    return result;
  }
} // class ExpertPlayer
