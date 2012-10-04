var lemonopoly = {};
lemonopoly.localData = {};
lemonopoly.localData.player_level = 1;

//
// Player ID for convenience
//
lemonopoly.player_id = 0;
var challenges_loaded = 0;
var profileChallengePromptDisplayed = 0;
var profilePromptDisplayed = 0;

var ua = navigator.userAgent,
    clickEvent = (ua.match(/iPad/i)) ? "touchstart" : "click";

//
// Address handling (a back button) for twitter bootstrap
//
lemonopoly.setupAddress = function () {
  // Add a hash to the URL when the user clicks on a tab.
  // Not IE7 compatible but oh well. If we need that we can switch to jquery address.
  lemonopoly.bindTabs();
  lemonopoly.tabInteractionsURL(); 
  lemonopoly.tabRouter(); 

};
//@TODO this is the same as setupAddress, but making a separate function for triggering after adding dynamic links to pages.
// Have to add the whole function.
// There may be a problem with binding multiple click events, vs having a click event that overrides, but
// I think that the tab 'shown' event needs to be there. so maybe we shound unbind and rebind the click event instead?
lemonopoly.rebindAddresses = function () {
  lemonopoly.bindTabs();
  lemonopoly.tabInteractionsURL(); 
  lemonopoly.tabRouter(); 
};

//
// bring up a login dialog
//

lemonopoly.loginPrompt = function() {
  alert("You need to login.");
};

lemonopoly.profilePrompt = function() {
  if(profilePromptDisplayed == 0) {
    alert("One more thing to do. Create a Profile and join a team!");
  }
  profilePromptDisplayed++;
};

lemonopoly.profileClaimPrompt = function() {
/*   if(profilePromptDisplayed == 0) { */
    alert("One more thing to do. Create a Profile and join a team!");
/*   } */
/*   profileChallengePromptDisplayed++; */
};

//
// start the app
//


window.onload = function() {

  ///////////////////////////////////////////////////////////////////////
  // start listeners
  ///////////////////////////////////////////////////////////////////////

  // add gps listener before map
  Kernel.addListener("gps",function(filter,target) {
    var player = Player.getLocalPlayer();
    if(player) {
       player.lat = lemonopoly.gps.coords.latitude;
       player.lon = lemonopoly.gps.coords.longitude;
       player.moved = 1;
       player.dirty = 1;
       Kernel.save(player,0);
    }
  });

  Kernel.addListener("player_loaded",function(filter,player) {
    //console.log("lemonopoly: Got a player loaded event with player_id set to " + player_id );
    if(!player || player_id != player._id || lemonopoly.player_id) {
      //console.log("lemonopoly: player id already present so just returning");
      return;
    }
    lemonopoly.player_id = player_id;
  
    // Give profile form to map add tree form.
    $('a.add-tree').unbind(clickEvent, lemonopoly.loginPrompt);
    $('a.add-tree').bind(clickEvent, lemonopoly.profilePrompt);  
  
    Profile.load(lemonopoly.player_id);
    
    if(challenges_loaded) {
      //console.log("lemonopoly: loading or reloading challenge statuses after loaded player");
      Kernel.query({"player_id":lemonopoly.player_id,"kind":"challenge_status"}, lemonopoly.challengeStatusLoadFilter);
      Claim.loadByPlayer(lemonopoly.player_id);
    }
    // if we have a gps event before player already then move the player
    if(lemonopoly.gps && player) {
      player.lat = lemonopoly.gps.latitude;
      player.lon = lemonopoly.gps.longitude;
      player.dirty = 1;
      player.moved = 1;
      Kernel.save(player);
    }    
  });

  Kernel.addListener("challenges_loaded",function(filter,target) {
    //console.log("lemonopoly: Got a challenges loaded event and player id is " + lemonopoly.player_id );
    challenges_loaded = 1;
    if(lemonopoly.player_id) {
      //console.log("lemonopoly: loading or reloading challenge statuses after loaded challenges");
      Kernel.query({"player_id":lemonopoly.player_id,"kind":"challenge_status"}, lemonopoly.challengeStatusLoadFilter);
      Claim.loadByPlayer(lemonopoly.player_id);
    }
  });
  
  Kernel.addListener("player_claims_loaded", function(filter,target) {
    //console.log("lemonopoly: player_claims_loaded");
    lemonopoly.processPlayerLevel();
  });


  ///////////////////////////////////////////////////////////////////////
  // start game
  ///////////////////////////////////////////////////////////////////////

  // load large complicated dynamic forms
  lemonopoly.claimFormLoad();
  lemonopoly.treeFormLoad();

  // load map
  lemonopoly.setupMap();
  lemonopoly.setupClaimMap();
  lemonopoly.setupTreeMap();
  
  // setup routing scheme
  lemonopoly.setupAddress();  
  
  $('#alert-box .message').html('');
  $('#alert-box').hide('');

  $('#beta-box').delay(8000).fadeOut("slow", function () { $(this).remove(); });

  // start facebook - may eventually fire a player_loaded message
  facebook_load_sdk();

  // load challenges
  Kernel.query2("raw/challenges",function(results) {
    challenges_loaded = 1;
    lemonopoly.challengesLoadFilter(results);
    Kernel.event("challenges_loaded");
    // load and show all claims after Challenges are loaded (they need to load challenge data)
    Claim.load();
  });

  Kernel.stats({}, lemonopoly.loadScores);
};

lemonopoly.loadScores = function(results) {
  //console.log("loadscores");

  var teams = lemonopoly.localData.teams = results;
  
  if(lemonopoly.localData.scoresTemplate === undefined) {
    var template = lemonopoly.localData.scoresTemplate = $("#scoresTemplate").html();  
  }
  else {
    var template = lemonopoly.localData.scoresTemplate;
  }

  $("#scores-list").html(_.template(template,{teams: teams}));
  
  //console.log(results);
};

// Add a hash to the URL when the user clicks on a tab.
lemonopoly.bindTabs = function () {

  // Prevent multiple click event bindings, while still keeping the event listener for tab 'shown'
  $('a[data-toggle="tab"]').unbind(clickEvent);
  // Not IE7 compatible but oh well. If we need that we can switch to jquery address.
  $('a[data-toggle="tab"]').bind(clickEvent, function(e) {
    //console.log("-----BINDING TABS-----" + $(this).attr('href'));
    history.pushState(null, null, $(this).attr('href'));
    e.preventDefault();
    $(this).tab('show');
  });
};

// Navigate to a tab when the history changes
lemonopoly.tabInteractionsURL = function(){
  window.addEventListener("popstate", function(e) {
    
    var activeTab = $('[href=' + location.hash + ']');

    if (activeTab.length) {
      activeTab.tab('show');
    } else {
      $('#home').tab('show');
    }
  });
};

lemonopoly.latchBox = 0;

// setup buttons and javascript actions for various tabs
lemonopoly.tabRouter = function() {

  $('a[data-toggle="tab"]').on('shown', function (e) {

    $('html, body').animate({scrollTop:0}, 'fast');

    var box = $(e.target).attr('href');
    if(box == lemonopoly.latchBox) box = ""; else lemonopoly.latchBox = box;

    if (box == '#map') {
      lemonopoly.mapUpdate(lemonopoly.map);
      
      $('footer').hide();
    } else {
      $('footer').show();
    }
    if (box == '#claims') {
      // we probably should call this every so often - Claim.load();
      lemonopoly.updateMasonry();

      // Update tweet buttons
      $.ajax({ url: 'http://platform.twitter.com/widgets.js', dataType: 'script', cache:true});

      // Update Facebook buttons
      try {
        FB.XFBML.parse(); 
      } catch(ex){}
    }
    else if (box == '#challenges') {
/*
      Claim.updateByPlayer(lemonopoly.player_id);
      lemonopoly.challengesLoadFilter(lemonopoly.localData.challenges);
*/
    }
    else if (box == '#profile') {
      Profile.load(lemonopoly.player_id);
    }
    else if (box == '#profile-edit') {
      lemonopoly.alterProfileEditForm();
    }
    else if ( box == '#claims-form') {
      lemonopoly.alterClaimForm();
    }
    else if (box == '#add-tree') {
      lemonopoly.alterLemonTreeForm();
    }
    else if (box == '#society') {
      lemonopoly.calculateTeamScores();
    }
  });
};

lemonopoly.calculateTeamScores = function() {
  // Can't do this because we don't have players data linked to their teams.
  var scores = {};
  scores.sanjose = {};
  scores.sanfrancisco = {};
  scores.oakland = {};
  scores.berkeley = {};
};
