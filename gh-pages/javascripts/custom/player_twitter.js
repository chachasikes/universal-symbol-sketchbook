//////// A MESS!! this won't work!!
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// twitter profile internal details
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var twitter_profile = 0;
var twitter_profile_id = 0;
var twitter_profile_title = "";
var twitter_profile_icon = "";
var twitter_profile_auth = 0;

function twitter_flush() {
  twitter_profile = 0;
  twitter_profile_id = 0;
  twitter_profile_title = "";
  twitter_profile_icon = "";
  twitter_profile_auth = 0;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App specific ui helpers - not critical - clearly you need these dom objects for these to work
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function twitter_application_binding_show_loggedout() {
  $('#auth-depiction').attr('src', '');
  $('#auth-displayname').html('');
  $('#auth-loggedout').show();
  $('#auth-loggedin').hide();
};

function twitter_application_binding_show_profile() {
  //console.log(twitter_profile_icon);
  
  $('#auth-depiction').attr('src', twitter_profile_icon);
  $('#auth-displayname').html(twitter_profile_title);
  $('#auth-loggedout').hide();
  $('#auth-loggedin').show();
};

function twitter_application_binding_add_clickers() {
  if(document.getElementById('auth-loginlink-twitter')) document.getElementById('auth-loginlink-twitter').addEventListener('click', twitter_login );
  if(document.getElementById('auth-logoutlink-twitter')) document.getElementById('auth-logoutlink-twitter').addEventListener('click', twitter_logout );
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// twitter utils
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function twitter_player_saved_handler(players) {
  //console.log("twitter: player save method hit");
  if(!players || players.length < 1 || !players[0]) {
    //console.log("twitter: failed to get player back from kernel save!");
    return;
  }
  var player = players[0];
  if(player._id === undefined || !(player._id)) {
    //console.log("twitter: failed to get valid player id back from kernel save!");
    return;
  }
  //console.log("twitter: save worked! " + player );
  //console.log("twitter: player id is " + player._id);
  twitter_profile_id = player.twitterid;
  twitter_profile_title = player.name; 
  twitter_profile_icon = player.profileImageUrl;
  twitter_application_binding_show_profile();
  Player.setLocalPlayer(player);
  //console.log("twitter: successfully associated player " + twitter_profile_id + " " + player._id );
  Kernel.event("player_loaded",player);
}

function twitter_complete_profile() {

  if(twitter_profile) {
    //console.log("twitter: load profile - had user already " + twitter_profile_id + " twitter profile id already here");
    return;
  } else {
    //console.log("twitter: twitter_complete_profile: starting to try load player from twitter");
  }

      if(twitter_profile_id) {
         // even though we failed to do a twitter login we have an id so try fetch player from our own db
         //console.log("Facebook: twitter is confused trying to load player from our own data");
         Kernel.query({"kind":"User","twitterid":twitter_profile_id},function(results) {
           //console.log("twitter: alter path closure");
           //console.log(results);
           twitter_player_saved_handler(results);
         });


      alert("Unknown error with twitter failing to login player - try refresh?");
      //console.log("twitter_get_profile: failed to get profile - trying to force logout");

/*       twitter_flush(); */
    /* twitter_profile = fbuser; */
/*     twitter_logout(); */
/* window.location.reload(); */
    //console.log("twitter: almost done - got fb response - now attempting to save name " + fbuser.name);

    var player = {"kind":"Player","twitterid":player.twitterid,"title":player.name,"art":twitter_profile_icon };
    Kernel.save(player,twitter_player_saved_handler);
}
}

function twitter_partial_profile(response) {

  //console.log("twitter: partial profile callback has responded with " + response.status );

  twitter_flush();

/*
  if (response.status === 'connected') {
    var uid = response.authResponse.userID;
    var accessToken = response.authResponse.accessToken;
    //console.log("twitter: player found with twitterid " + uid + " - refetching full profile");
    twitter_profile_id = uid;
    twitter_profile_auth = response.authResponse;
    twitter_complete_profile();
  } else if (response.status === 'not_authorized') {
    //console.log("twitter: no player found");
    twitter_application_binding_show_loggedout();
  } else {
    //console.log("twitter: no player found");
    twitter_application_binding_show_loggedout();
  }
*/

}

//
// Init the Facebook SDK
//

function twitter_async_init() {
  //console.log("-----twitter async");
  twitter_application_binding_add_clickers();
}

//
// Login and log out
//

function twitter_login() {
  //console.log("twitter_login");

  if( !twitter_profile_auth ) {
    //console.log("twitter: manual login triggered");
    

  } 
  /*
  else {
    //console.log("twitter: manual login attempted but player appears to be logged in?");
    alert("You appear to be logged in already. Try refresh page?");
    window.location.reload();
  }
*/

  //window.location.reload();
}

function twitter_logout() {
/*
  //console.log("twitter_logout: trying to explicitly manually logout " + twitter_profile_auth );
  if( !twitter_profile_auth ) {
    alert("You appear to be logged out already. Try Refresh page?");
    // return; don't do this try anyway
  }
  // Kernel.event("player_unloaded",player);
  twitter_flush();
  FB.logout( function(results) {
    window.location.reload();
    // console.log("twitter: logout success");
    // console.log(results);
    // twitter_application_binding_show_loggedout(); // @TODO may be optional
  });
*/
twitter_application_binding_show_loggedout();
}

//
// Attach twitter loader - invoked by below
//
/* window.onload = twitter_async_init(); */

