function ChallengeStatus(title){ 
  assert(0); // unused
  this.title=title;
  this.kind="challenge_status";
  this.player_id="";
  this.challenge_id="";
} 
ChallengeStatus.inheritsFrom(Agent);
ChallengeStatus.prototype.createInstance=function(){ 
  var thing = this.parent.createInstance.call(this);
  return thing;
} 
ChallengeStatus.prototype.toString=function(){ 
  return '[ChallengeStatus "'+this.title+'"]';
} 

//
// accept or reject a challenge given a player
// @TODO it would be nice to not have to pass the challenge id
// @TODO it might be nice to just DELETE the challenge status rather than mark as rejected // @TODO We are, right?
//
ChallengeStatus.accept = function(challenge_id,player_id,callback) {
  var mycallback = callback;
  var mychallenge_id = challenge_id;
  var myplayer_id = player_id;

  Kernel.query({"player_id":myplayer_id,"challenge_id":mychallenge_id, "kind":"challenge_status"}, function(results) {
    var cs = {};
    if(results && results.length>0) {
      cs = results[0];
    }
    cs.challenge_id = mychallenge_id;
    cs.player_id = myplayer_id;
    cs.kind = "challenge_status";
    cs.title = "Challenge Accepted";
    Kernel.save(cs,mycallback);
  });
}

ChallengeStatus.reject = function(challenge_id,player_id,callback) {
  var mychallenge_id = challenge_id;
  var myplayer_id = player_id;
  var mycallback = callback;

  var cs = {};
  cs.challenge_id = mychallenge_id;
  cs.player_id = myplayer_id;
  cs.kind = "challenge_status";
  Kernel.destroy(cs,mycallback);
}
