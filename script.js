eX = true;
var players = 1;
var auto = true;

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

function setX(value) {
  useX = value;
  styleButtons("#b1", "#b2", useX);
}

function setPlayers(value) {
  players = value;
  styleButtons("#b3", "#b4", (players == 1));
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
  ttt.init();
  gameState = ttt.INPLAY;
}

function setCell(slot) {
  if (gameState !== ttt.INPLAY)
    return;
  
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
     console.log("X Wins!!!");
      console.log(ttt.winSlots);
     for (slot=0; slot<ttt.winSlots.length; slot++) {
        id = "#val" + ttt.winSlots[slot];
        $(id).addClass("won");
      }
      break;
    case ttt.WIN0:
      console.log("0 Wins!!!");
      for (slot=0; slot<ttt.winSlots.length; slot++) {
        id = "#val" + ttt.winSlots[slot];
        $(id).addClass("won");
      }
      break;
    case this.DRAW:
       console.log("Draw!!!");
      break;
  }
  
  if (!auto && players == 2) {
    useX = !useX;
  }
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
    var slot = Number.parseInt(e.target.id.replace("cell", "").replace("val", ""));
    setCell(slot);
  });
});







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
      
    this.init();
  }

  init () {
    this.slots = [ 
      [this.SLOT_,this.SLOT_,this.SLOT_],
      [this.SLOT_,this.SLOT_,this.SLOT_],
      [this.SLOT_,this.SLOT_,this.SLOT_]
    ];   
    this.winSlots = [];
  }
  
  move(who, slot) {
    var x = (Number.parseInt(slot / 10)) -1;
    var y = (slot % 10) -1;
    console.log(x + "," + y);
    this.slots[x][y] = who;
  }
  
  check() {
    var result = this.INPLAY;
    if (result === this.INPLAY) {
      this.winSlots = [];
      if ((this.slots[0][0] + this.slots[0][1] + this.slots[0][2]) === 3)
        this.winSlots = [11, 12, 13];
      if ((this.slots[1][0] + this.slots[1][1] + this.slots[1][2]) === 3)
        this.winSlots = [21, 22, 23];
      if ((this.slots[2][0] + this.slots[2][1] + this.slots[2][2]) === 3)
        this.winSlots = [31, 32, 33];
      if ((this.slots[0][0] + this.slots[1][0] + this.slots[2][0]) === 3)
        this.winSlots = [11, 21, 31];
      if ((this.slots[0][1] + this.slots[1][1] + this.slots[2][1]) === 3)
        this.winSlots = [12, 22, 32];
      if ((this.slots[0][2] + this.slots[1][2] + this.slots[2][2]) === 3) 
        this.winSlots = [13, 23, 33];
      if ((this.slots[0][0] + this.slots[1][1] + this.slots[2][2]) === 3)
        this.winSlots = [11, 22, 33];
      if ((this.slots[0][2] + this.slots[1][1] + this.slots[2][0]) === 3)
        this.winSlots = [13, 22, 31];
      if (this.winSlots.length > 0)
        result = this.WINX;        
    }
    if (result === this.INPLAY) {
      this.winSlots = [];
      if ((this.slots[0][0] + this.slots[0][1] + this.slots[0][2]) === 15)
        this.winSlots = [11, 12, 13];
      if ((this.slots[1][0] + this.slots[1][1] + this.slots[1][2]) === 15)
        this.winSlots = [21, 22, 23];
      if ((this.slots[2][0] + this.slots[2][1] + this.slots[2][2]) === 15)
        this.winSlots = [31, 32, 33];
      if ((this.slots[0][0] + this.slots[1][0] + this.slots[2][0]) === 15)
        this.winSlots = [11, 21, 31];
      if ((this.slots[0][1] + this.slots[1][1] + this.slots[2][1]) === 15)
        this.winSlots = [12, 22, 32];
      if ((this.slots[0][2] + this.slots[1][2] + this.slots[2][2]) === 15) 
        this.winSlots = [13, 23, 33];
      if ((this.slots[0][0] + this.slots[1][1] + this.slots[2][2]) === 15)
        this.winSlots = [11, 22, 33];
      if ((this.slots[0][2] + this.slots[1][1] + this.slots[2][0]) === 15)
        this.winSlots = [13, 22, 31];
      if (this.winSlots.length > 0)
        result = this.WIN0;        
    }
    if (result === this.INPLAY) {
      var done = true;
      for (var x=0; x<3; x++) {
        for (var y=0; y<3; y++) {
          if (this.slots[x][y] === this.SLOT_)
            done = false;
        }
      }
      if (done)
        result = this.DRAW;
    }
    return result;
  }
}


