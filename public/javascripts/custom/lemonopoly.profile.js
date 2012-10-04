function Profile(title){ 
  assert(0);
  this.title=title;
  this.kind="Profile";
};

Profile.inheritsFrom(Agent);

Profile.prototype.createInstance=function(){ 
  var thing = this.parent.createInstance.call(this);
  return thing;
};
 
Profile.prototype.toString=function(){ 
  return '[Profile "'+this.title+'"]';
}; 

lemonopoly.loadProfileDisplay = function(results) {
  //console.log("lemonopoly::load profile display has been called");

  if(!results || results.length < 1 || results[0]["kind"] !== "profile" ) {
    //console.log("lemonopoly::load profile invalid profile");
    $('#alert-box .message').html('<i class="icon-user"></i>Create your <a href="#profile-edit" data-toggle="tab"><strong>Profile</strong></a> and join a team for the full experience.');
    $('#alert-box').show();
    lemonopoly.rebindAddresses();
    
    return;
  }
  
  var profile = results.reverse()[0]; // @TODO this is a hack because multiple entries are saved - getting the last one.
  lemonopoly.localData.profile = results[0];

  if(lemonopoly.localData.challenge_statuses !== undefined){
    profile.accepted_challenges = {};
    for(key in lemonopoly.localData.challenge_statuses) {
      var item = lemonopoly.localData.challenge_statuses[key];
      var challenge_id = item.challenge_id;
      var challenge = lemonopoly.challengesLoadByID(challenge_id);
      profile.accepted_challenges[challenge_id] = challenge;
    }
  }

  if(profile.updated_at) {
    var joined = new Date(profile.updated_at);
    profile.joined = joined.format("m/dd/yy");
  }
  
  profile.team_name = lemonopoly.loadTeam(profile.team);

  //console.log("lemonopoly::profile set profile!");

  if(profile.title !== undefined && profile.title !== ""){
    lemonopoly.loadProfileDisplayTemplate(profile);
  }
  
  lemonopoly.rebindAddresses();
};

lemonopoly.loadTeam = function(team_id){
  var team_id = team_id;

  var teamOptions = {
    "team-0": "San Francisco", 
    "team-1": "Oakland", 
    "team-2": "Berkeley", 
    "team-3": "San Jose"
  };

  for(key in teamOptions) {
    if(key === team_id) {
      return teamOptions[key];
    }
  }
}

lemonopoly.loadProfileDisplayTemplate = function(profile) {    
  if(lemonopoly.localData.profileTemplate === undefined) {
    var template = lemonopoly.localData.profileTemplate = $("#profileTemplate").html();    
  }
  else {
    var template = lemonopoly.localData.profileTemplate;
  }
  $("#profile-detail").html(_.template(template,{profile:profile}));
};

lemonopoly.formatPlayerTeam = function(team) {
  var team = team;
  return team;
};

lemonopoly.formatPlayerNeighborhood = function(neighborhood) {
  var neighborhood = neighborhood;
  return neighborhood;
};

lemonopoly.formatPlayerInterest = function(interest) {
  switch(interest){
    case "have_tree": return "Tree Grower. I have a lemon tree & want to share lemons."; break;
    case "tree_outreach": return "Outreach. Encourage a tree owner to share lemons"; break;
    case "value_added_services": return "Maker. Provide Value-Added services"; break;
    case "gleaner": return "Gleaner. I'm interested in helping people pick fruits in hard to reach places."; break;
    case "tree_verification": return "Inspector. I'm interested in visiting trees."; break;
    case "lemon_distribution": return "Distributor. Pick up and distribute lemons"; break;
    case "lemon_market": return "Marketeer. Sell lemons at farmer's market or popup retail district"; break;
    case "lemon_retail": return "Retailer. Work with local stores to offer and sell local lemons"; break;
    case "tree_grafting": return "Grafter. Plant and graft lemon trees for distribution to public green spaces"; break;
    case "baby_tree": return "New Tree Owner. I would like to get a dwarf indoor lemon tree"; break;
    case "tree_steward": return "Steward. Steward a tree"; break;
    case "lemoncraft": return "Teacher. Teach a workshop or class"; break;
    case "lemon_retail_corner_store": return "Food Justice. Identify convenience stores that don’t sell citrus fruit"; break;
    case "food_service": return "Food service. I want to help make lemon goods for events & gatherings."; break;
    case "community_organization": return "Community Organization. I would like my organization to be listed as a resource in the lemon economy."; break;
    case "food_service_provider": return "Food service. I have a food business or restaurant and would like to provide lemon menu items & products."; break;
    case "blogger": return "Blogger. I want to blog & report on this game."; break;
    case "organizer": return "Organizer. I'm interested in helping to organize the game"; break;
    case "lemonocrat": return "Lemonocrat. I'm interested in helping facilitate & provide technology for the game"; break;
  }
};


lemonopoly.formatPlayerRole = function(role) {
  switch(role){
    case "park_ranger": return "Park Ranger"; break;
    case "lemonaid_worker": return "LemonAID Worker"; break;
  }
};

Profile.load = function(player_id) {
  Kernel.query({"player_id":player_id,"kind":"profile"}, lemonopoly.loadProfileDisplay );
}

lemonopoly.profileLogout = function() {
  // unused
};
