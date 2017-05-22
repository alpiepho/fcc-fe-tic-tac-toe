
var givenUseX = true;
var useX      = true;
var players   = 1;
var auto      = true;

var ttt;
var gameState;

function styleButtons(b1, b2, state) {
  $(b1).removeClass("btn-on");
  $(b2).removeClass("btn-on");
  $(b1).removeClass("btn-off");
  $(b2).removeClass("btn-off");
  if (state) {
    $(b1).addClass("btn-on");
    $(b2).addClass("btn-off");
  } else {
    $(b1).addClass("btn-off");
    $(b2).addClass("btn-on");
  }
}

function styleWin() {
  for (var slot=0; slot<ttt.winSlots.length; slot++) {
    id = "#val" + ttt.winSlots[slot];
    $(id).addClass("won");
  }
  if (gameState === ttt.WINX)
    $("#status").text("X wins!!!");
  else
    $("#status").text("0 wins!!!");
  $("#status").addClass("won");

}

function styleDraw() {
  $("#val11").addClass("draw");
  $("#val12").addClass("draw");
  $("#val13").addClass("draw");
  $("#val21").addClass("draw");
  $("#val22").addClass("draw");
  $("#val23").addClass("draw");
  $("#val31").addClass("draw");
  $("#val32").addClass("draw");
  $("#val33").addClass("draw");
  $("#status").text("draw :(");
  $("#status").addClass("draw");
}

function setX(value) {
  givenUseX = value;
  useX = value;
  styleButtons("#b1", "#b2", useX);
}

function setPlayers(value) {
  players = value;
  styleButtons("#b3", "#b4", (players == 1));
  if (players === 1) {
    $("#l3").show();
    $("#b5").show();
    $("#b6").show();
  } else {
    // 2 player needs to hid auto
    $("#l3").hide();
    $("#b5").hide();
    $("#b6").hide();
  }
}

function setAuto(value) {
  auto = value;
  styleButtons("#b5", "#b6", auto);
}

function clearBoard() {
  $("#val11").text("_");
  $("#val12").text("_");
  $("#val13").text("_");
  $("#val21").text("_");
  $("#val22").text("_");
  $("#val23").text("_");
  $("#val31").text("_");
  $("#val32").text("_");
  $("#val33").text("_");
  $("span").removeClass("won");
  $("span").removeClass("draw");
  $("#status").text("game in progess...");
  $("#status").removeClass("won");
  $("#status").removeClass("draw");
  useX = givenUseX;
  ttt.init();
  gameState = ttt.INPLAY;
}

function setCell(slot) {
  if (gameState !== ttt.INPLAY)
    return;
  if (slot === 0) {
    useX = !useX;
    return;
  }

  var id = "#val" + slot;

  if (useX) {
    $(id).text("X");
    ttt.move(ttt.SLOTX, slot);
  }
  else {
    $(id).text("0");
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
  ttt = new TicTacToe();
  clearBoard();

  $("#b1").click(function() { setX(true); });
  $("#b2").click(function() { setX(false); });
  setX(useX);
  $("#b3").click(function() { setPlayers(1); });
  $("#b4").click(function() { setPlayers(2); });
  setPlayers(players);
  $("#b5").click(function() { setAuto(true); });
  $("#b6").click(function() { setAuto(false); });
  setAuto(auto);
  $("#b7").click(function() { clearBoard(); });
  $(".cell").click(function(e) {
    // e.target.id could be cellNN or valNN, get NN
    var slot;
    slot = e.target.id.replace("cell", "").replace("val", "");
    slot = Number.parseInt(slot);
    setCell(slot);

    if (players === 1) {
      if (auto)
        slot = ttt.autoMove( (useX ? ttt.SLOTX : ttt.SLOT0) );
      else
        slot = ttt.randomMove( (useX ? ttt.SLOTX : ttt.SLOT0) );
      setCell(slot);
    }

  });
});






// class for the Tic Tac Toe Game
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
    this.moves = 0;

    this.init();
  }

  // iniialize the board
  init () {
    this.slots = [
      this.SLOT_,this.SLOT_,this.SLOT_,
      this.SLOT_,this.SLOT_,this.SLOT_,
      this.SLOT_,this.SLOT_,this.SLOT_
    ];
    this.winSlots = [];
    this.moves = 0;
  }

  // process a move
  move(who, slot) {
    var y = (Number.parseInt(slot / 10)) -1;
    var x = (slot % 10) -1;
    console.log(slot);
    console.log(x);
    console.log(y);
    console.log(y*3 + x);
    this.slots[y*3 + x] = who;
    this.moves++;
  }

  // check the board for win/draw
  check() {
    var result = this.INPLAY;
    if (result === this.INPLAY) {
      this.winSlots = [];
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 3)
        this.winSlots = [11, 12, 13];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 3)
        this.winSlots = [21, 22, 23];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 3)
        this.winSlots = [31, 32, 33];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 3)
        this.winSlots = [11, 21, 31];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 3)
        this.winSlots = [12, 22, 32];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 3)
        this.winSlots = [13, 23, 33];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 3)
        this.winSlots = [11, 22, 33];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 3)
        this.winSlots = [13, 22, 31];
      if (this.winSlots.length > 0)
        result = this.WINX;
    }
    if (result === this.INPLAY) {
      this.winSlots = [];
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 15)
        this.winSlots = [11, 12, 13];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 15)
        this.winSlots = [21, 22, 23];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 15)
        this.winSlots = [31, 32, 33];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 15)
        this.winSlots = [11, 21, 31];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 15)
        this.winSlots = [12, 22, 32];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 15)
        this.winSlots = [13, 23, 33];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 15)
        this.winSlots = [11, 22, 33];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 15)
        this.winSlots = [13, 22, 31];
      if (this.winSlots.length > 0)
        result = this.WIN0;
    }
    if (result === this.INPLAY) {
      var done = true;
      for (var x=0; x<3; x++) {
        for (var y=0; y<3; y++) {
          if (this.slots[y*3 + x] === this.SLOT_)
            done = false;
        }
      }
      if (done)
        result = this.DRAW;
    }
    return result;
  }

  // NOTE: these could be another class, randomPlayer/autoPlayer
  canWin(currentXor0) {
    var result = false;
    this.winSlots = [];
    if (currentXor0 === this.SLOT0) {
      // if we are currently 0, check for any near wins of X
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 2)
        this.winSlots = [11, 12, 13];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 2)
        this.winSlots = [21, 22, 23];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 2)
        this.winSlots = [31, 32, 33];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 2)
        this.winSlots = [11, 21, 31];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 2)
        this.winSlots = [12, 22, 32];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 2)
        this.winSlots = [13, 23, 33];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 2)
        this.winSlots = [11, 22, 33];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 2)
        this.winSlots = [13, 22, 31];
     }
    if (currentXor0 === this.SLOTX) {
      if ((this.slots[0] + this.slots[1] + this.slots[2]) === 10)
        this.winSlots = [11, 12, 13];
      if ((this.slots[3] + this.slots[4] + this.slots[5]) === 10)
        this.winSlots = [21, 22, 23];
      if ((this.slots[6] + this.slots[7] + this.slots[8]) === 10)
        this.winSlots = [31, 32, 33];
      if ((this.slots[0] + this.slots[3] + this.slots[6]) === 10)
        this.winSlots = [11, 21, 31];
      if ((this.slots[1] + this.slots[4] + this.slots[7]) === 10)
        this.winSlots = [12, 22, 32];
      if ((this.slots[2] + this.slots[5] + this.slots[8]) === 10)
        this.winSlots = [13, 23, 33];
      if ((this.slots[0] + this.slots[4] + this.slots[8]) === 10)
        this.winSlots = [11, 22, 33];
      if ((this.slots[2] + this.slots[4] + this.slots[6]) === 10)
        this.winSlots = [13, 22, 31];
    }
    if (this.winSlots.length > 0) {
      // find to the one empty slot
      var slot;
      for (var index=0; index < this.winSlots.length; index++) {
        var slot = this.winSlots[index];
        var y = (Number.parseInt(slot / 10)) -1;
        var x = (slot % 10) -1;
        if (this.slots[y*3 + x] == this.SLOT_)
          break;
      }
      this.winSlots = [ slot ];
      result = true;
     }

    return result;
  }

  // NOTE: this could be another class, randomPlayer
  randomMove(currentXor0) {
    if (this.check() !== this.INPLAY)
      return 0;

    // first check if there is a must block
    if (this.canWin(currentXor0))
      return ttt.winSlots[0];

    // ok, not random, just first open slot
    for (var x=0; x<3; x++) {
      for (var y=0; y<3; y++) {
        if (ttt.slots[y*3 + x] == this.SLOT_) {
          var slot = (x+1)*10 + (y+1);
          return slot;
        }
      }
    }
    return 0;
  }


  // NOTE: this could be another class, autoPlayer
  autoMove(currentXor0) {
    if (this.check() !== this.INPLAY)
      return 0;

    // first check if there is a must block
    if (this.canWin(currentXor0))
      return ttt.winSlots[0];
/*
    // ok, not random, just first open slot
    for (var x=0; x<3; x++) {
      for (var y=0; y<3; y++) {
        if (ttt.slots[x][y] == this.SLOT_) {
          var slot = (x+1)*10 + (y+1);
          return slot;
        }
      }
    }
    */
    return 0;
  }

} // class TicTacToe
