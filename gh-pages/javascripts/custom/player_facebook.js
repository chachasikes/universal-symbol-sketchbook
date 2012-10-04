
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// facebook profile internal details
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var facebook_profile_id = 0;
var facebook_profile_auth = 0;
var facebook_profile_icon = "";

function facebook_flush() {
  facebook_profile_id = 0;
  facebook_profile_auth = 0;
  facebook_profile_icon = "";
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// App specific ui helpers - not critical - clearly you need these dom objects for these to work
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function facebook_application_binding_show_loggedout() {
  $('.auth-depiction').attr('src', '');
  $('.auth-displayname').html('');
  $('.auth-loggedout').show();
  $('.auth-loggedin').hide();
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// facebook utils
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function facebook_set_globals(player) {

  // sanity check
  if(!player || player === undefined || player._id === undefined || !(player._id)) {
    //console.log("facebook: failed to get valid player id back from kernel save!");
    return;
  }

  // store a cookie because facebook is erratic

  var date = new Date();
  date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
  $.cookie("cached-player", JSON.stringify(player), { expires: date } );
  //console.log("saving cookie for player " + JSON.stringify(player) );

  // setup globals
  //console.log("facebook: save worked! " + player );
  //console.log("facebook: player id is " + player._id);
  var icon = 'http://graph.facebook.com/' + player.fbid + '/picture';

  // convenience
  facebook_profile_id = player.fbid;
  facebook_profile_icon = icon;

  // setup art
  //console.log(icon);
  $('.auth-depiction').attr('src', icon);
  $('.auth-displayname').html(player.title);
  $('.auth-loggedout').hide();
  $('.auth-loggedin').show();

  // advise lower levels
  Player.setLocalPlayer(player);
  Kernel.event("player_loaded",player);
  //console.log("facebook: successfully finalized player load " + player._id );
}

function facebook_player_saved_handler(players) {
  //console.log("facebook: player save method hit");
  if(!players || players.length < 1 || !players[0]) {
    //console.log("facebook: failed to get player back from kernel save!");
    return;
  }
  facebook_set_globals(players[0]);
}

function facebook_get_details_callback(fbuser) {
  if (typeof fbuser === "undefined" || !fbuser.id) {
    if(facebook_profile_id) {
       // even though we failed to do a facebook login we have an id so try fetch player from our own db
       //console.log("Facebook: facebook is confused trying to load player from our own data");
       Kernel.query({"kind":"Player","fbid":facebook_profile_id},function(results) {
         //console.log("facebook: alter path closure");
         //console.log(results);
         facebook_player_saved_handler(results);
       });
       return;
    }
    alert("Unknown error with facebook failing to login player - try refresh?");
    //console.log("facebook_get_profile: failed to get profile - trying to force logout");
    //console.log(fbuser);
    facebook_flush();
    //FB.logout( function(results) {
    //  //console.log("facebook: complete profile successfully forced logout");
    //});
    //facebook_logout();
    //window.location.reload();
    return;
  }
 
  //console.log("facebook: almost done - got fb response - now attempting to save name " + fbuser.name);
  var icon = 'http://graph.facebook.com/' + fbuser.id + '/picture';
  var player = {"kind":"Player","fbid":fbuser.id,"title":fbuser.name,"art":icon };
  Kernel.save(player,facebook_player_saved_handler);
};

//
// We're part way there - got the fb confirm now lets get the deets
//

function facebook_partial_profile(response) {
  //console.log("facebook: partial profile callback has responded with " + response.status );
  facebook_flush();
  if (response.status === 'connected') {
    var uid = response.authResponse.userID;
    var accessToken = response.authResponse.accessToken;
    //console.log("facebook: player found with fbid " + uid + " - refetching full profile");
    if(facebook_profile_id) {
      //console.log("facebook: load profile - had user already " + facebook_profile_id + " fb profile id already here");
      return;
    } 
    facebook_profile_id = uid;
    facebook_profile_auth = response.authResponse;
    //console.log("facebook: facebook_complete_profile: starting to try load player from fb");
    FB.api('/me', facebook_get_details_callback );
  } else if (response.status === 'not_authorized') {
    //console.log("facebook: no player found");
    facebook_application_binding_show_loggedout();
  } else {
    //console.log("facebook: no player found");
    facebook_application_binding_show_loggedout();
  }
}

//
// Init the Facebook SDK
//

function facebook_async_init() {
  
  // We have two facebook accounts for developing and logging in locally and on lemonopoly.org.

  var lemonopoly_org = "175831115818604";
  var lemonopoly_local = "261068034010884";
  
  if(window.location.hostname == "lemonopoly.local") {
    var fb_app_id = lemonopoly_local;  
  }
  else {
    var fb_app_id = lemonopoly_org;
  }

  FB.init({ appId: fb_app_id,
           status: true,
           cookie: true,
            xfbml: true,
       channelUrl: '//'+window.location.hostname+'/channel.html'
  });

  FB.getLoginStatus(facebook_partial_profile,true);
  //FB.Event.subscribe('auth.statusChange',facebook_partial_profile);
}

//
// Login and log out
//

function facebook_login() {
  //console.log("facebook::login");
  if( !facebook_profile_auth ) {
    //console.log("facebook: manual login triggered");
    FB.login(facebook_partial_profile);
  } else {
    //console.log("facebook: manual login attempted but player appears to be logged in?");
    alert("You appear to be logged in already. Try refresh page?");
    window.location.reload();
  }
}

function facebook_logout() {
  //console.log("facebook_logout: trying to explicitly manually logout " + facebook_profile_auth );
  if( !facebook_profile_auth ) {
    alert("You appear to be logged out already. Try Refresh page?");
    // return; don't do this try anyway
  }
  // Kernel.event("player_unloaded",player);
  facebook_flush();
  FB.logout( function(results) {
    window.location.reload();
    // console.log("facebook: logout success");
    // console.log(results);
    // facebook_application_binding_show_loggedout();
  });
  
  $.cookie("cached-player", null);
  window.location.reload();
}

//
// Load the Facebook SDK - triggering the cascade above
//

function facebook_load_sdk() {

  // add some art handlers
  $('a.auth-loginlink').click( facebook_login );
  $('a.auth-logoutlink').click( facebook_logout );

  // try use a cached version first
  var cached = $.cookie("cached-player");
  if(cached) {
    //console.log("facebook: fetching player from cookie");
    var player = JSON.parse(cached);
    facebook_set_globals(player);
  }

  // start fb
  window.fbAsyncInit = facebook_async_init;
  (function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
  }(document));
}

