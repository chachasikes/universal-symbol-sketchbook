var player_id = 0;

function Player(title,fbid,art) { 
  // @TODO remove unused
  alert(0);
  this.title=title;
  this.fbid=fbid;
  this.art=art;
  this.email="";
  this.kind="Player";
};

Player.inheritsFrom(Agent);

Player.prototype.toString = function(){ 
  return '[Player "'+this.title+'"]';
};

Player.prototype.localPlayer = null;

Player.prototype.getLocalPlayer = function() {
  return Player.prototype.localPlayer;
};

Player.getLocalPlayer = function() {
  // @TODO can I remove the non prototype method?
  return Player.prototype.localPlayer;
};

Player.prototype.setLocalPlayer = function(player) {
  Player.prototype.localPlayer = player;
  if(player) {
    player_id = player._id;
    Player.player_id = player._id;
    //console.log("Player global local player is now set! " + player + " " + player_id); 
  }
};

Player.setLocalPlayer = function(player) {
  // @TODO can I remove the non prototype method?
  Player.prototype.localPlayer = player;
  if(player) {
    player_id = player._id;
    Player.player_id = player._id;
    //console.log("Player global local player is now set! " + player + " " + player_id); 
  }
};

Player.getTitle = function() {
  if(Player.prototype.localPlayer) return Player.prototype.localPlayer.title;
  return "No name";
};


