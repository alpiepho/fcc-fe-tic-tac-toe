
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
    id = "#v" + ttt.winSlots[slot];
    $(id).addClass("won");
  }
  if (gameState === ttt.WINX)
    $("#status").text("X wins!!!");
  else
    $("#status").text("0 wins!!!");
  $("#status").addClass("won");

}

function styleDraw() {
  $(".val").addClass("draw");
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
  $(".val").text("_");
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
  if (slot < 0) {
    useX = !useX;
    return;
  }

  var id = "#v" + slot;

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
    console.log(e.target.id);
    slot = e.target.id.replace("c", "").replace("v", "");
    slot = Number.parseInt(slot);
    setCell(slot);

    if (players === 1) {
      if (auto)
        slot = ttt.expertOpponentMove( (useX ? ttt.SLOTX : ttt.SLOT0) );
      else
        slot = ttt.simpleOpponentMove( (useX ? ttt.SLOTX : ttt.SLOT0) );
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
    console.log(slot);
    this.slots[slot] = who;
    this.moves++;
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

  // NOTE: these could be another class, randomPlayer/autoPlayer
  canWin(currentXor0) {
    var result = false;
    this.winSlots = [];
    if (currentXor0 === this.SLOT0) {
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
    if (currentXor0 === this.SLOTX) {
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

  // NOTE: this could be another class, randomPlayer
  simpleOpponentMove(currentXor0) {
    if (this.check() !== this.INPLAY)
      return 0;

    // first check if there is a must block
    if (this.canWin(currentXor0))
      return ttt.winSlots[0];

    // ok, not random, just first open slot
    for (var slot=0; slot<9; slot++) {
      if (ttt.slots[slot] == this.SLOT_) {
        return slot;
      }
    }
    return 0;
  }


  // NOTE: this could be another class, autoPlayer
  expertOpponentMove(currentXor0) {
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
