///////////////////////////////////////////////////////////////////////////////////
// Global challenge categories - hardcoded for now
// @TODO eventually build this list automatically.
///////////////////////////////////////////////////////////////////////////////////////////

lemonopoly.challengeCategories = function(challenges) {

  var autocomplete = [];
  for (var i in challenges) {
    var item = challenges[i];
    var item_categories = JSON.parse(item.categories_json);
    autocomplete = _.union(autocomplete, item_categories, item.title, item.description);
  }

  $('#challenges-autocomplete').typeahead({source:autocomplete});
  
  $('#challenges-autocomplete').change(function(){
    $('#challenges-main-categories-options').val("all");
    var count = 0;
    var query =  $('input#challenges-autocomplete').val();
    $('#challenges-list .challenge').each(function(){  
      var text = $(this).html();      
      var match = text.search(query);
      if(match != -1){
        $(this).show();
        count++;
        $('.number-challenges').html(count + " for " + query);
      }
      else if(query === ""){
        $(this).show();
        count++;
        $('.number-challenges').html(count);
      }
      else{
        $(this).hide();
      }
    });  
  });


  $('#challenges-main-categories-options').change(function(){
    var count = 0;
    $('#challenges-autocomplete').val('');
    var link_category = $(this).find("option:selected").text();
    $('#challenges-list .challenge').each(function(){  
      var category = $(this).find('.category .value').html();      
      var re = new RegExp("regex","g");
      var match = category.match(re, link_category);
      
      if(category.indexOf(link_category) != -1){
        $(this).show();
        count++;
        $('.number-challenges').html(count + " in " + link_category);
      }
      else if(link_category === "All"){
        $(this).show();
        count++;
        $('.number-challenges').html(count + " in " + link_category + " categories");
      }
      else{
        $(this).hide();
      }
    });
  });

};

////////////////////////////////////////////////////////////////////////////////////////
// load challenges
////////////////////////////////////////////////////////////////////////////////////////

lemonopoly.challengesLoadFilter = function(challenges) {

  if(!challenges) return;
  //console.log("lemonopoly::views loaded challenges of length " + challenges.length );

  var challenges = challenges;
  // Store in local data hash.
  lemonopoly.localData.challenges = challenges;
  
  // Filter out by level.
  challenges = _.filter(challenges, function(challenge){ 
    var level = 1;

    if(lemonopoly.localData.player_level !== undefined) {
      var level = lemonopoly.localData.player_level;
    }

    switch(level) {
      case 1: if (challenge.level == 1) return challenge.level; break;
      case 2: if (challenge.level == 1 || challenge.level == 2)  return challenge.level; break;
      case 3: if ( challenge.level == 1 || challenge.level == 2 || challenge.level == 3)  return challenge.level; break;
      case 4: return challenge.level; break;
    }

    return challenge.level == level;
  });
  

  if(lemonopoly.localData.challengesTemplate === undefined) {
    var template = lemonopoly.localData.challengesTemplate = $("#challengesTemplate").html();    
  }
  else {
    var template = lemonopoly.localData.challengesTemplate;
  }
  var loaded = $("#challenges-list").html(_.template(template,{challenges:challenges}));

  // build challenge categories display
  lemonopoly.challengeCategories(challenges);
  
  // Build challenge options for forms
  lemonopoly.localData.challengeOptions = lemonopoly.challengeOptions(challenges);

  // attach expand shrink buttons to the challenge art
  $('.challenge-title').toggle(
    function() {$(this).parent().find('.challenge-info').show();},
    function() {$(this).parent().find('.challenge-info').hide();}  
  );

  $('p.points-summary').toggle(
    function() {$(this).parent().parent().find('.challenge-info').show();},
    function() {$(this).parent().parent().find('.challenge-info').hide();}  
  );
  
  $('.accept-challenge').click(lemonopoly.loginPrompt);
  $('.make-claim').click(lemonopoly.loginPrompt);

  if(player_id !== 0 && player_id !== undefined && lemonopoly.localData.profile === undefined) {
    $('.accept-challenge').unbind(clickEvent, lemonopoly.loginPrompt);
    $('.accept-challenge').click(lemonopoly.profileClaimPrompt);
    $('.make-claim').unbind(clickEvent, lemonopoly.loginPrompt);
    $('.make-claim').click(lemonopoly.profileClaimPrompt);
  }
};

lemonopoly.challengesLoadByID = function(challenge_id) {
  if(!lemonopoly.localData.challenges) return;
  var challenge_id = challenge_id;
  for(var i = 0 ; i < lemonopoly.localData.challenges.length; i++) {
    if(lemonopoly.localData.challenges[i]["id"] === challenge_id) {
      return lemonopoly.localData.challenges[i];
    }
  }
};

// Build list of display-friendly challenges for select box options.
lemonopoly.challengeOptions = function(challenges) {
  if(!challenges) return;
  var challengeOptions = {};

  for(var i =0 ; i < challenges.length; i++) {  
    challengeOptions[challenges[i]["id"]] = challenges[i]["title"];
  }
  
  lemonopoly.localData.challengeOptions = challengeOptions;
  return challengeOptions;
};


///////////////////////////////////////////////////////////////////////////////////////////
// ui for accepting or rejecting challenges
// loading of per player challenge statuses also
///////////////////////////////////////////////////////////////////////////////////////////

lemonopoly.challengeAccept = function() {
  var player_id = lemonopoly.player_id;
  //console.log("accept" + player_id);
  var id = $(this).attr('challenge');
  //console.log("Accepted challenge " + id); 
  if(player_id !== undefined) {
    ChallengeStatus.accept(id,player_id,lemonopoly.setChallengeStatusDisplay);
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').removeClass('active');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').removeClass('inactive');
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').addClass('inactive');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').addClass('active');
  }
  else {
    alert("Challenge accept+ You must sign in" + player_id);
  }
} 

lemonopoly.setChallengeStatusDisplay = function() {
 //console.log("-------------saved challenge status");
} 

lemonopoly.challengeReject = function() {
  var player_id = lemonopoly.player_id;
  var id = $(this).attr('challenge');
  //console.log("Rejected challenge " + id);  
  if(!id || !player_id)return;
  if(player_id !== undefined) {
    ChallengeStatus.reject(id,player_id,lemonopoly.setChallengeStatusDisplay);
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').removeClass('inactive');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').removeClass('active');
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').addClass('active');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').addClass('inactive');
  }
}

lemonopoly.challengesClearAll = function() {
  if(!lemonopoly.localData.challenges) return;
  //console.log("lemonopoly_challenges: clearing all");
  for(var i = 0 ; i < lemonopoly.localData.challenges.length; i++) {
    var id = lemonopoly.localData.challenges[i]["id"];
    if(!id)continue;
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').removeClass('inactive');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').removeClass('active');
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').addClass('active');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').addClass('inactive');
  }

  // @TODO should log out the player ui's as well... but for now we just reset the page.

};

lemonopoly.challengeLogout = function() {

  lemonopoly.challengesClearAll();
  
  $('.accept-challenge').unbind(clickEvent, lemonopoly.challengeAccept);
  $('.reject-challenge').unbind(clickEvent, lemonopoly.challengeReject);
  $('.accept-challenge').bind(clickEvent, lemonopoly.loginPrompt);

  $('.make-claim').unbind(clickEvent, lemonopoly.alterClaimForm);
  $('.make-claim').click(lemonopoly.loginPrompt);  

  $('.make-claim').removeAttr('data-target', '#claims-form');
  $('.make-claim').removeAttr('data-toggle', 'tab');

  $('.make-claim').unbind(clickEvent, lemonopoly.loginPrompt);  
  $('.make-claim').bind(clickEvent, lemonopoly.alterClaimForm);
};


lemonopoly.challengeStatusLoadFilter = function(results){
  // Change button interactions.
  $('.accept-challenge').unbind(clickEvent, lemonopoly.loginPrompt);
  $('.accept-challenge').click( lemonopoly.challengeAccept);
  $('.reject-challenge').click( lemonopoly.challengeReject);

  $('.make-claim').attr('data-target', '#claims-form');
  $('.make-claim').attr('data-toggle', 'tab');

  $('.make-claim').unbind(clickEvent, lemonopoly.loginPrompt);  
  $('.make-claim').bind(clickEvent, lemonopoly.alterClaimForm);



  var statuses = results;
  if(!statuses || statuses === undefined || statuses.length < 1) {
    $('#challenges-list .challenge-title').toggle($('#challenges-list .challenge .challenge-info').show(), $('#challenges-list .challenge .challenge-info').hide());
    return;
  }
  //console.log("lemonopoly challenge status: trying to setup statuses with " + statuses );
  
  lemonopoly.localData.challenge_statuses = statuses;
  // adjust challenge art to show if you accepted it or not
  for (key in statuses) {
    var status = statuses[key];
    if(status == undefined) continue;
    var id = status.challenge_id; 
    //console.log("lemonopoly challenge status: trying to setup status " + id ); 
    if(!id)continue;
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').removeClass('active');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').removeClass('inactive');
    $('#challenges-list .challenge .challenge-status .accept-challenge[challenge="' + id + '"]').addClass('inactive');
    $('#challenges-list .challenge .challenge-status .reject-challenge[challenge="' + id + '"]').addClass('active');
  };

  //now that we have totally loaded and rendered the challenges, hide the extra info.
  $('#challenges-list .challenge .challenge-info').hide();
  $('#challenges-list .challenge-title').toggle($('#challenges-list .challenge .challenge-info').show(), $('#challenges-list .challenge .challenge-info').hide());

  // attach buttons to the challenge art in general once only - @TODO presumes player is loaded maybe better in a player load fn
}

