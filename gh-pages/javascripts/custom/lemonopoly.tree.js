function Tree(title){ 
  this.title=title;
  this.kind="Tree";
} 
Tree.inheritsFrom(Agent);

Tree.prototype.createInstance=function(){ 
  var thing = this.parent.createInstance.call(this);
  return thing;
}

Tree.prototype.toString=function(){ 
  return '[Tree "'+this.title+'"]';
} 

//
// accept or reject a challenge given a player
// @TODO it would be nice to not have to pass the challenge id
// @TODO it might be nice to just DELETE the challenge status rather than mark as rejected
//
Tree.load = function(player_id,callback) {
  var mycallback = callback;
  var myplayer_id = player_id;

  // Load contributed tree data
  Kernel.query({"kind": "tree"}, function(results) {
    var tree = {};
    if(results && results.length>0) {
      tree = results[0];
    }
    tree.player_id = myplayer_id;
    tree.kind = "tree";
    
    mycallback(results);  
  });

  // Load public lemon data
  Kernel.query2("lemons",function(results) {
    var tree = {};
    if(results && results.length>0) {
      tree = results[0];
    }
    tree.player_id = myplayer_id;
    tree.kind = "tree";
    
    mycallback(results);  
  });
}

lemonopoly.loadTree = function() {  
  Tree.load(player_id,lemonopoly.loadTreeDisplay);
};

lemonopoly.loadTreeByPlayer = function() {  
  Tree.load(player_id,lemonopoly.loadTreeDisplay);
};

lemonopoly.loadTreeDisplay = function(results) {
  //console.log("trees");
  //console.log(results);
};
