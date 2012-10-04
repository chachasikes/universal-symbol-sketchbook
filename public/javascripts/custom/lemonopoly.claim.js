function Claim(title){ 
  this.title=title;
  this.kind="Claim";
} 
Claim.inheritsFrom(Agent);
Claim.prototype.createInstance=function(){ 
  var thing = this.parent.createInstance.call(this);
  return thing;
};
Claim.prototype.toString=function(){ 
  return '[Claim "'+this.title+'"]';
};


lemonopoly.loadOembed = function(container) {
  var container = container;
  // https://github.com/starfishmod/jquery-oembed-all
    $(container).each(function(){
      var url = $(this).find('.image').attr('href');
      if(url !== undefined) {

        var flickr = url.match(/flickr.com/g);
        var youtube = url.match(/youtube.com/g);
        var vimeo = url.match(/vimeo.com/g);
        var twitpic = url.match(/twitpic.com/g);
        var photobucket = url.match(/photobucket.com/g);
        var instagram = url.match(/instagram.com/g);
        var twitter = url.match(/twitter.com/g);
        
        var jpeg = url.match(/.jpeg$/g);
        var jpg = url.match(/.jpg$/g);
        var png = url.match(/.png$/g);
        var gif = url.match(/.gif$/g);
        
      if(flickr !== null || youtube !== null || vimeo !== null || twitpic !== null || photobucket !== null || instagram !== null || twitter !== null) {

        $(this).find('.image').oembed(url,{
            embedMethod: "replace", 
                maxWidth: 300,
                maxHeight: 300,
                vimeo: { autoplay: false, maxWidth: 300, maxHeight: 260},
                youtube: { autoplay: false, maxWidth: 300, maxHeight: 260},
        });

        /*     $(this).find('.embed').embedly({key: "b17f593c1c734ce5af968cebe29474ec"}); */
      }
      else if(jpeg !== null || jpg !== null || png !== null || gif !== null) {
        var link = '<a href="' + url + '" target="_blank" class="image"><img src="' + url + '" /></a>';
        $(this).find('.media').html(link);
        
      }
      else {
        var link = "";
        $(this).find('.media').css("height","auto");
      }
  }    
  });
};

lemonopoly.processPlayerLevel = function() {
  var claims = lemonopoly.localData.player_claims;
  if(claims === undefined) { 
    $('.player-level').show();
    $('.levels-table tr.level-1').addClass('active');
    $('.levels .message').html('Do three claims to get to Level 2!');  
    return; 
  }

  var levels = [0,0,0,0];  
  for(key in claims){
    var item = claims[key];
    if(item.challenge !== undefined){
      switch(item.challenge.level) {
        case 1: levels[0]++; if(levels[0] > 3) lemonopoly.localData.player_level = 2; 
          break;
        case 2: levels[1]++; if(levels[1] > 2) lemonopoly.localData.player_level = 3; 
          break;    
        case 3: levels[2]++; if(levels[2] > 1) lemonopoly.localData.player_level = 4;
          break;
        case 4: levels[3]++; if(levels[3] > 1) lemonopoly.localData.player_level = 5;
          break;
      }
    }

  }
    console.log(levels);
  $('.player-level').show();    
  $('.player-level-value').html(lemonopoly.localData.player_level);

  switch(lemonopoly.localData.player_level) {
      case 1:
        $('.levels .message').html('Do three claims to get to Level 2!');
        $('.levels-table tr.level-1').addClass('active');
        break;
      case 2:
        $('.levels .message').html('Do two claims to get to Level 3!');
        $('.levels-table tr.level-2').addClass('active');
        break;    
      case 3:
        $('.levels .message').html('Do 1 more claim to get to Level 4!');
        $('.levels-table tr.level-3').addClass('active');
        break;
      case 4:
        $('.levels .message').html('You win!');
        $('.levels-table tr.level-4').addClass('active');
        break;
  }
              
  lemonopoly.challengesLoadFilter(lemonopoly.localData.challenges);  
  lemonopoly.challengeStatusLoadFilter(lemonopoly.localData.challenge_statuses);
};

lemonopoly.loadActivityDisplay = function(results) {
  var trees = results;
  // @TODO don't need to store - these trees are also findable by asking the kernel with   Kernel.query_local({"player_id": myplayer_id, "kind":"claim"});
  lemonopoly.localData.player_trees = trees;
  //console.log("activity");  
  //console.log(trees);
  
  if(lemonopoly.localData.claims !== undefined) {
    var activity = _.union(trees, lemonopoly.localData.claims);
  }
  else {
    var activity = trees;
  }
  //console.log("activityall");
  //console.log(activity);

  if(activity.length == 0) {    Kernel.event("player_trees_and_claims_loaded");  return; }
  //console.log("player trees and claims display");

  for(key in activity){
    var item = activity[key];

    // Claims is already set up, set up tree.
    if (item.kind === "tree") {
      // Process tree markup.
      if (item.proof !== undefined) {
        // @TODO TEST VALID
        item.url = item.proof;
      }   
      
      item.address = "";
      if(item.address_street_name) item.address += " " + item.address_street_name;
      if(item.address_city) item.address += " " + item.address_city;
      if(item.address_zipcode) item.address += " " + item.address_zipcode;
      if(item.address_state) item.address += " " + item.address_state;

      var joined = new Date(item.created_at);
      item.created_at = joined.format("m/dd/yy");

      item.tree_name = lemonopoly.loadTreeNames(item.variety);
      item.stewardship = lemonopoly.loadTreeStewardship(item.stewardship);
    }
  }

  lemonopoly.loadActivityAllTemplate(activity);
};

lemonopoly.loadActivityPlayerDisplay = function(results) {
  var trees = results;
  // @TODO don't need to store - these trees are also findable by asking the kernel with   Kernel.query_local({"player_id": myplayer_id, "kind":"claim"});
  lemonopoly.localData.player_trees = trees;
  //console.log("activity");  
  //console.log(trees);
  
  if(lemonopoly.localData.player_claims !== undefined) {
    var activity = _.union(trees, lemonopoly.localData.player_claims);
  }
  else {
    var activity = trees;
  }
  //console.log("activity");
  //console.log(activity);

  if(activity.length == 0) {    Kernel.event("player_trees_and_claims_loaded");  return; }
  //console.log("player trees and claims display");

  for(key in activity){
    var item = activity[key];

    // Claims is already set up, set up tree.
    if (item.kind === "tree") {
      // Process tree markup.
      if (item.proof !== undefined) {
        // @TODO TEST VALID
        item.url = item.proof;
      }   
      
      item.address = "";
      if(item.address_street_name) item.address += " " + item.address_street_name;
      if(item.address_city) item.address += " " + item.address_city;
      if(item.address_zipcode) item.address += " " + item.address_zipcode;
      if(item.address_state) item.address += " " + item.address_state;

      // customizations for tree.
      item.tree_name = lemonopoly.loadTreeNames(item.variety);

    

    }
  }

  lemonopoly.loadActivityPlayerTemplate(activity);
};

lemonopoly.loadActivityAllTemplate = function(activity) {
  //console.log("activity");
  //console.log(activity);

  if(lemonopoly.localData.activityTemplate === undefined) {
    var template = lemonopoly.localData.activityTemplate = $("#claimsTemplate").html();  
  }
  else {
    var template = lemonopoly.localData.activityTemplate;
  }


  $("#claims-list").html(_.template(template,{activity:activity}));

  lemonopoly.loadOembed('#claims-list .item');

  // Get id from url parameter if set.
  var prmstr = window.location.search.substr(1);
  var prmarr = prmstr.split ("&");
  var params = {};
  
  for (var i = 0; i < prmarr.length; i++) {
      var tmparr = prmarr[i].split("=");
      params[tmparr[0]] = tmparr[1];
  }
  var claims_id = params.id;

  if(claims_id !== undefined) {
    console.log(claims_id);
    $('div#' + claims_id).css("background-color", "#ffffff");
    var pos = $('div#' + claims_id).offset();
    console.log(pos);
    $('body').animate({ scrollTop: pos.top - 240 });
    
    $('meta[property="og:title"]').attr('content', $('div#' + claims_id + ' .content h3'));
    $('meta[property="og:image"]').attr('content', $('div#' + claims_id + ' .content .media img').attr("src"));    
    $('meta[property="og:description"]').attr('content', $('div#' + claims_id + ' .content .notes'));
        
    // reset meta tag so link appears better on facebook.
  }  
    
  //jquery.masonry.min.js - http://masonry.desandro.com/
  

  lemonopoly.initMasonry('#claims-list');

/*   $("#claims-list .media").css("height", "auto"); */
};



lemonopoly.initMasonry = function(container){
  var container = container;
  var $container = $(container);

  var gutter = 60;
  var min_width = 320;


  $container.imagesLoaded( function(){
      $container.masonry({
          itemSelector : '.item',
          gutterWidth: gutter,
          isAnimated: false,
            columnWidth: function( containerWidth ) {
              if(containerWidth == 0) {
                containerWidth = 320;
              }
              var num_of_boxes = (containerWidth/min_width | 0);

              var box_width = (((containerWidth - (num_of_boxes-1)*gutter)/num_of_boxes) | 0) ;

              if (containerWidth < min_width) {
                  box_width = containerWidth;
              }

              $('.item').width(box_width);

              return box_width;
            }
      });

  });
};

lemonopoly.updateMasonry = function (){
  $('#claims-list').masonry( 'reload' );
};

lemonopoly.loadActivityPlayerTemplate = function(activity) {
  if(lemonopoly.localData.playerClaimTemplate === undefined) {
    var template = lemonopoly.localData.playerClaimTemplate = $("#claimsProfileTemplate").html();  
  }
  else {
    var template = lemonopoly.localData.playerClaimTemplate;
  }

  $("#claims-profile-list").html(_.template(template,{activity:activity}));
  lemonopoly.loadOembed('#claims-profile-list .item');

  // @TODO for some reason if this happens before the template is rendered, it breaks it.
  Kernel.event("player_claims_loaded", claims, lemonopoly.processPlayerLevel);
};

lemonopoly.loadClaimsProcess = function(results) {
  var claims = results;

  //console.log(claims);
  if(claims.length == 0) {    Kernel.event("player_claims_loaded");  return; }
  //console.log("player claims display");

  for(key in claims){
    var item = claims[key];
    item.challenge = lemonopoly.challengesLoadByID(item.challenge_id);
    item.number_lemons_involved = lemonopoly.numberLemonsDisplay(item.number_lemons_involved);

    if(item.teams instanceof Array) {
      item.team_name = "";
      for(key in item.teams) {
        item.team_name += lemonopoly.loadTeam(item.teams[key]);
      }
    }
    else {
      item.team_name = lemonopoly.loadTeam(item.teams);
    }
    if (item.proof !== undefined) {
      // @TODO TEST VALID
      item.url = item.proof;
    }
    if(item.notes !== undefined) {
      item.tweet = lemonopoly.trimTweet(item.notes);
    }

    // Refresh tweet buttons.
    $.ajax({ url: 'http://platform.twitter.com/widgets.js', dataType: 'script', cache:true});
  }

  // @TODO don't need to store - these claims are also findable by asking the kernel with   Kernel.query_local({"player_id": myplayer_id, "kind":"claim"});
  lemonopoly.localData.claims = claims;
};

lemonopoly.loadClaimsPlayerProcess = function(results) {
  var claims = results;

  //console.log(claims);
  if(claims.length == 0) {    Kernel.event("player_claims_loaded");  return; }
  //console.log("player claims display");

  for(key in claims){
    var item = claims[key];
    item.challenge = lemonopoly.challengesLoadByID(item.challenge_id);
    item.number_lemons_involved = lemonopoly.numberLemonsDisplay(item.number_lemons_involved);

    if(item.teams instanceof Array) {
      item.team_name = "";
      for(key in item.teams) {
        item.team_name += lemonopoly.loadTeam(item.teams[key]);
      }
    }
    else {
      item.team_name = lemonopoly.loadTeam(item.teams);
    }
    if (item.proof !== undefined) {
      // @TODO TEST VALID
      item.url = item.proof;
    }
  }

  // @TODO don't need to store - these claims are also findable by asking the kernel with   Kernel.query_local({"player_id": myplayer_id, "kind":"claim"});
  lemonopoly.localData.player_claims = claims;
};


lemonopoly.numberLemonsDisplay = function(option){
  if(option === undefined) { return; }
  var options = {
    "a_few" : "A few",
    "box" : "A box",
    "truckload" : "A truckload"
  }

  return options[option];
};

Claim.loadByPlayer = function(player_id) {
  //console.log("load Claims and Trees by Player");
  // we only ever need to call this once because from that point on it is cached in the kernel memory
  // @TODO but we don't have an update function.
  Kernel.query({"player_id": player_id, "kind":"claim"}, function(results) {
    lemonopoly.loadClaimsPlayerProcess(results)
    Kernel.query({"player_id": player_id, "kind":"tree"}, lemonopoly.loadActivityPlayerDisplay);
  });

};

Claim.load = function() {
  // it makes sense to call this multiple times since other clients can add stuff to the server and our view may be obsolete
  Kernel.query({"kind":"claim"}, function(results) {
    lemonopoly.loadClaimsProcess(results);
    Kernel.query({"kind":"tree"}, lemonopoly.loadActivityDisplay);  
  });

};

lemonopoly.loadTreeNames = function(option) {
  switch(option){
    case "lemon": return "Lemon"; break;
    case "lemon_meyer": return "Improved Meyer Lemon"; break;
    case "lemon_eureka": return "Eureka Lemon"; break;
    case "lemon_lisbon": return "Lisbon Lemon"; break;
    case "lemon_ponderosa": return "Ponderosa"; break;
    case "lemon_genoa_italian": return "Genoa Italian Lemon"; break;
    case "lemon_variegated_pink": return "Variegated Pink Lemon (Pink Lemonade)"; break;
    case "lemon_bearss": return "Bearss Lime"; break;
  }
};

lemonopoly.loadTreeStewardship = function(option) {
  switch(option){
    case "public" : return "<em>Public</em> Open Access (Lemons are free to pick.)"; break;
    case "semi-public" : return "<em>Semi-Public</em> (Tree on public land but requires appointment to visit.)"; break;
    case "communally_grown" : return "<em>Communal</em> (This tree is part of a farm or garden.)"; break;
    case "private_by_appt" : return "<em>Private Tree</em> (Visit by appointment only.)"; break;
    case "private" : return "<em>Private Tree</em> (Please do not disturb residents, tree noted for data purposes only)"; break;
    case "undetermined" : return "<em>Undetermined</em>"; break;
  }
};

lemonopoly.trimTweet = function(str){
  if(str !== undefined) {
    // strip html tags.
    str = str.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, "");
    str = str.length > (90 - 3) ? str.substring(0,90) + '...' : str;

    return str;
  }
};
