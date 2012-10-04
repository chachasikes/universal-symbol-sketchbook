
lemonopoly.blockMultipleCalls = 0;

lemonopoly.alterProfileEditForm = function(){
  var player_id = lemonopoly.player_id;
  $('input#player_id').val(player_id);
 
  // set a default name
  $('#profile-form input#player_name').val(Player.getTitle());

  // try store location of player profile
  if(lemonopoly.gps && lemonopoly.gps.coord !== undefined) {
    $('input#lat').val(lemonopoly.gps.coords.latitude);
    $('input#lon').val(lemonopoly.gps.coords.longitude);      
  }

  //console.log("lemonopoly::forms setting profile details");
  //console.log(lemonopoly.localData.profile);

  // populate if present
  if(lemonopoly.localData.profile !== undefined) {
  //console.log(lemonopoly.localData.profile._id);
    $('#profile-form input#_id').val(lemonopoly.localData.profile._id);
    $('#profile-form input#player_name').val(lemonopoly.localData.profile.title);
    $('#profile-form #' + lemonopoly.localData.profile.team + '').attr('checked', 'checked');
    $('#profile-form input#zipcode').val(lemonopoly.localData.profile.zipcode);
  }

  // save on click handler
  $("#profile-form").submit(function() {

    if(lemonopoly.blockMultipleCalls) {
      //console.log("lemonopoly::alter profile blocking duplicate re-entry prior to completion!");
      return 0;
    }
    lemonopoly.blockMultipleCalls = 1;

    var data = $("#profile-form").serialize();
    Kernel.save(data,function(results) {
      if(results && results.length && results[0]["kind"] == "profile") lemonopoly.localData.profile = results[0]; // slight hack
      lemonopoly.blockMultipleCalls = 0;
      $('#alert-box .message').html('');
      $('#alert-box').hide('');
      Profile.load(lemonopoly.player_id);
      $('a[href="#profile"]').click();
    });

    return false; 
  });
};

lemonopoly.alterClaimForm = function(e) {

  history.pushState(null, null, '#claims-form');

  // Update map display.
  var zoom =  lemonopoly.map_claims.getZoom();
  lemonopoly.map_claims.zoom(zoom);
      
  // Hard coded player id.
  var player_id = lemonopoly.player_id;
     
  var challenge_id = $(this).attr("challenge");  
  var currentChallenge = lemonopoly.challengesLoadByID(challenge_id);

  // Reset all form values. 
  $('#claims-form input[name=proof]').val('');
  $('#claims-form textarea[name=notes]').val('');


  $('#claims-form .title').html(currentChallenge.title);
  $('#claims-form .info').html(currentChallenge.description);
  $('#claims-form .category').html(currentChallenge.category);

  $('#claims-form .difficulty').html(currentChallenge.difficulty);
  $('#claims-form .importance').html(currentChallenge.importance);
  $('#claims-form .points_summary').html(currentChallenge.points_summary);

  // Set player_id  
  $('input[name=player_id]').val(player_id);

  // Display player name
  $('div[name=player_name]').html(Player.getTitle());
  $('input[name=player_name_store]').val(Player.getTitle());
  
  if(lemonopoly.localData.profile !== undefined) {
    $('div[name=player_name]').html(lemonopoly.localData.profile.title);
  }

  if(lemonopoly.localData.profile !== undefined) {

    if(lemonopoly.localData.profile.team ){
      var team_name = lemonopoly.loadTeam(lemonopoly.localData.profile.team);
      
      $('div[name=teams_display]').html(team_name + '<div class="change">Change</a>');
       
      $('div[name=teams_display] .change').toggle(
        function(){
          $('#add-claim select#teams').show(); 
          $('div[name=teams_display] .change').html("hide")}, 
        
        function(){
          $('#add-claim select#teams').hide(); 
          $('div[name=teams_display] .change').html("Change")
      });
          
      $('div[name=team]').val(lemonopoly.localData.profile.team);
      $('input[name=team_name_store]').val(lemonopoly.loadTeam(lemonopoly.localData.profile.team));
      $('#add-claim select#teams').hide();
        
      $('#add-claim select#teams').change(function(){  
        var team_name = $('#add-claim select#teams option:selected').html();
        $('div[name=teams_display]').html(team_name);
        $('input[name=team_name_store]').val(team_name);
      });
    }
  }
  else{ 
    $('#add-claim select#teams').show();
    $('#add-claim select#teams').after('<a href="#profile-edit" style="display:block">Create your profile and set your team.</a>');
    lemonopoly.rebindAddresses();
  }
  
  var challenge_id = challenge_id;

  // Load a Challenge Options and readable names.
  var challengeOptions = lemonopoly.localData.challengeOptions;

  // Depends on challenge Options being set. Loads after challenges are loaded.
  if (challengeOptions !== undefined) {
    var select = $('select[name=challenge_id]');  
    var options = '';
    for (key in challengeOptions) {
      options += '<option value="' + key + '">' + challengeOptions[key] + '</option>';
    }
  
    $('select[name=challenge_id]').html(options);
    // Set to the clicked on challenge.
  }

  $("select[name=challenge_id] option[value='" + challenge_id + "']").attr('selected', 'selected');
  $('select[name=challenge_id]').hide();


  lemonopoly.mapUpdate(lemonopoly.map_claims);
  // Geolocate claim.
  if(lemonopoly.map_claims !== undefined) {
    var mapCenter = lemonopoly.map_claims.center();
    $('#claim-form input#lat').val(mapCenter.lat);
    $('#claim-form input#lon').val(mapCenter.lon);
  }  

  lemonopoly.map_claims.addCallback('drawn', function(m) {
    var center = m.getCenter(); 
    $('input#lat').val(center.lat);
    $('input#lon').val(center.lon);    
  });

  $('html, body').animate({scrollTop:0}, 'fast');
  
  $("#claim-form").submit(function() {

    if(lemonopoly.blockMultipleCalls) {
      //console.log("lemonopoly::alter profile blocking duplicate re-entry prior to completion!");
      return 0;
    }
    lemonopoly.blockMultipleCalls = 1;

    var data = $("#claim-form").serialize();
    Kernel.save(data,function(results) {
      if(results && results.length && results[0]["kind"] == "claim") lemonopoly.localData.profile = results[0]; // slight hack
      lemonopoly.blockMultipleCalls = 0;
      $('#alert-box .message').html('Your claim is now sitting in the Claim Box awaiting review by a Lemonocrat.');
      $('#alert-box').show('');
      $('a[href="#claims"]').click();
    });


    // we want to update the profile form display now that this has been created.
    return false; 
  });
};
/*

// @TODO what was this supposed to do?
lemonopoly.claimFormDone = function(response) {
};
*/



lemonopoly.alterLemonTreeForm = function() {
  var player_id = lemonopoly.player_id;  

  history.pushState(null, null, '#add-tree');

  $('#tree-form input[name=title]').val("Lemon Tree");
  $('#tree-form input[name=player_id]').val(player_id);

  $('div#lemon_owner_data').hide(); 
  
  $('form#tree-form div#ownership input').change(function(){
    $('div#lemon_owner_data').hide();
      if($(this).val() == "1") {
        $('div#lemon_owner_data').show();
      }
  });


  lemonopoly.mapUpdate(lemonopoly.map_trees);
  
  // Geolocate claim.
  if(lemonopoly.map_trees !== undefined) {
    var mapCenter = lemonopoly.map_trees.center();
    $('#tree-form input#lat').val(mapCenter.lat);
    $('#tree-form input#lon').val(mapCenter.lon);
  }  

  lemonopoly.map_trees.addCallback('drawn', function(m) {
    var center = m.getCenter(); 
    $('input#lat').val(center.lat);
    $('input#lon').val(center.lon);    
  });

  
  // attach handler to form's submit event 
  $("#tree-form").submit(function() {
      // submit the form 
      // @BUG? This function can run several times for some reason (counted 6 times on one form save, why?)  (tabs????)

      $(this).ajaxSubmit(); 

      // todo should try use kernel.save like profile does

      // "redirect" action (toggle tab)
      $('a[href="#map"]').click();
      // return false to prevent normal browser submit and page navigation
      return false; 
  });
};


/*

lemonopoly.alterTeamForm = function() {
  var player_id = lemonopoly.player_id;
  var mapCenter = map.center();
  $('input#lat').val(mapCenter.lat);
  $('input#lon').val(mapCenter.lon);
  $('input#player_id').val(player_id);
  $('input#player_name').val( player.getTitle() );

  $('div#neighborhood_san_francisco_container').hide();   
  $('div#neighborhood_berkeley_container').hide();
  $('div#neighborhood_oakland_container').hide();
  $('div#neighborhood_san_jose_container').hide();

  $('select#neighborhood_oakland').val('');
  $('select#neighborhood_san_francisco').val('');
  $('select#neighborhood_berkeley').val('');
  $('select#neighborhood_san_jose').val('');

  $('form#team-edit-form div#team input').change(function(){

    $('div#neighborhood_san_francisco_container').hide();   
    $('div#neighborhood_berkeley_container').hide();
    $('div#neighborhood_oakland_container').hide();
    $('div#neighborhood_san_jose_container').hide();
    
    $('select#neighborhood_oakland').val('');
    $('select#neighborhood_san_francisco').val('');
    $('select#neighborhood_berkeley').val('');
    $('select#neighborhood_san_jose').val('');


    if($(this).is(':checked')) {

      if($(this).val() == "San Francisco") {
        $('div#neighborhood_san_francisco_container').show();      
      }

      if($(this).val() == "Berkeley") {
        $('div#neighborhood_berkeley_container').show();
      }

      if($(this).val() == "Oakland") {
        $('div#neighborhood_oakland_container').show();
      }

      if($(this).val() == "San Jose") {
        $('div#neighborhood_san_jose_container').show();
      }

    } else {

    }
  });

};

*/

/*
 Validator functions. Should roll these into a better place in the code.
*/

$.validator.addMethod('positiveNumber',
    function (value) { 
        return Number(value) > 0;
    }, 'Enter a positive number.');


$.validator.addMethod('validZipcode',
    function (value) {
        var validZipcodes = [
          94601,
          94602,
          94603,
          94605,
          94606,
          94607,
          94609,
          94610,
          94611,
          94612,
          94618,
          94619,
          94621,
          94102,
          94103,
          94104,
          94105,
          94107,
          94108,
          94109,
          94110,
          94111,
          94112,
          94114,
          94115,
          94116,
          94117,
          94118,
          94121,
          94122,
          94123,
          94124,
          94127,
          94128,
          94129,
          94130,
          94131,
          94132,
          94133,
          94134,
          94702,
          94703,
          94704,
          94705,
          94707,
          94708,
          94709,
          94710
        ];

        return validZipcodes.indexOf(parseInt(value)) > -1;
    }, 'Sorry you need to be within the playing area to play Lemonopoly.');
    

$.validator.addMethod('validPlayer',
    function (value) { 
        return Number(value) > 0;
    }, 'The player needs to be registered with the game.');    

$.validator.addMethod('validLemon',
    function (value) { 
        return Number(value) > 0;
    }, '<p>It might be possible to get a Lemonopoly player to help you figure out what is the matter with your tree. Pruning and tree care can make a difference in the quality of your fruit. You can get Lemonopoly points for attending to your tree.</p><p>Lemons are still valuable even if pithy. Did you know that you can still harvest peel. The Vitamin C of lemons is in the peel.</p>');  


$.validator.addMethod('edibleLemon',
    function (value) { 
        return Number(value) > 0;
    }, 'edible lemon note');  


lemonopoly.treeFormLoad = function(data) {
  $('#tree-form').dform({
    "action": "/agent/save",
    "method": "post",
    "html":[
        {
            "type":"fieldset",
            "html":[
                {
                    "name":"title",
                    "value": "Lemon Tree",
                    "type": "hidden"
                },
                {
                    "name":"variety",
                    "caption": "<h3>Lemon Tree Variety</h3><p>If you know the variety of the lemon tree, please select it.</p>",
                    "type":"select",
                    "options" : {
                        "general_lemon" : {
                          "type" : "optgroup",
                          "label" : "Lemon",
                          "options" : {
                            "lemon" : {
                              "selected" : "selected",
                              "html" : "Lemon"
                            }
                          }
                        },
                        "bay_area_lemons" : {
                          "type" : "optgroup",
                          "label" : "Bay Area Lemons",
                          "options" : {
                            "lemon_meyer" : "Improved Meyer Lemon",
                            "lemon_eureka" : "Eureka Lemon",
                            "lemon_lisbon" : "Lisbon Lemon",
                            "lemon_ponderosa" : "Ponderosa Lemon",
                            "lemon_genoa_italian" : "Genoa Italian Lemon",
                            "lemon_variegated_pink" : "Variegated Pink Lemon (Pink Lemonade)",
                            "lemon_bearss" : "Bearss Lime"
                          }
                        },
                      }
                },
                { 
                  "name": "variety_other",
                  "type": "text",
                  "id": "variety_other",
                  "caption": "Enter the lemon variety if not listed or unsure."
                },
                {
                    "name":"quantity_trees",
                    "id":"quantity_trees",
                    "caption":"<h3>How many lemon trees?</h3>",
                    "type":"text",
                    "value": "1"
                },
                {
                    "name":"description",
                    "caption":"<h3>Notes</h3><p>Any words about this tree that you would like to share?</p>",
                    "type":"textarea",
                    "placeholder":"About this tree"
                },
                {
                  "name":"proof",
                  "caption":"<h3>Picture.</h3><p>Submit a URL for a picture of the tree.</p>",
                  "type":"url",
                  "placeholder":"http://"
                },
                {
                    "name":"stewardship",
                    "id": "stewardship",
                    "caption":"<h3>Stewardship</h3><p>Is this a public or private lemon tree?</p>",
                    "type":"radiobuttons",
                    "options" : {
                      "public" : "<em>Public</em> Open Access (Lemons are free to pick.)",
                      "semi-public" : "<em>Semi-Public</em> (Tree on public land but requires appointment to visit.)",
                      "communally_grown" : "<em>Communal</em> (This tree is part of a farm or garden.)",
                      "private_by_appt" : "<em>Private Tree</em> (Visit by appointment only.)",
                      "private" : "<em>Private Tree</em> (Please do not disturb residents, tree noted for data purposes only)",
                      "undetermined" : "<em>Undetermined</em>"
                    }
                },
                {
                  "name": "productivity",
                  "id": "productivity",
                  "caption": "<h3>Productivity</h3><p>Will this tree produce lemons in 2012-2013?</p>",
                  "type": "radiobuttons",
                  "options": {
                    "yes" : "Yes",
                    "no" : "No"
                    }
                },
                {
                  "name":"condition",
                  "id": "condition",
                  "caption": "<h3>Is the tree healthy?</h3>",
                  "type":"radiobuttons",
                  "options": {
                    "healthy": "<em>Yes</em><span class=\"form-detail\">This tree is healthy.</span>",
                    "fungus_undiagnosed": "<em>No</em><span class=\"form-detail\">Tree has a known pest, disease or fungus, and was <em>not</em> diagnosed by a professional</span>",
                    "fungus_diagnosed": "<em>No</em> <strong>Diagnosed</strong> <span class=\"form-detail\">Tree has a known pest, disease or fungus, and <em>was</em> diagnosed by a professional.</span>"
                  }
                },                    
                {
                "name": "edible",
                "id": "edible",
                "caption": "<h3>Edibility</h3><p>Does this lemon tree produce fruit that you consider to be edible or you use in your cooking?</p>",
                "type": "radiobuttons",
                "options": {
                  "1" : "<em>Yes!</em>",
                  "0" : "<em>No</em> Fruits are overgrown, pithy, deformed or bitter."
                  }
                },                
                {
                  "name": "canopy_height",
                  "caption": "<h3>How tall is this tree?</h3>",
                  "id": "canopy_height",
                  "type": "text"
                },
                {
                "name": "date_planted",
                "id": "date_planted",
                "caption": "<h3>Date Planted</h3><p>When was this tree planted?</p>",
                "type": "text"
                },
                {
                  "name": "address_street_name",
                  "id": "address_street_name",
                  "caption": "<h3>Street Address</h3>Street Name",
                  "type": "text"
                },
                {
                  "name": "address_city",
                  "id": "address_city",
                  "caption": "City",
                  "type": "text"
                },
                {
                  "name": "address_zipcode",
                  "id": "address_zipcode",
                  "caption": "Zipcode",
                  "type": "text"
                },
                {
                  "name": "address_state",
                  "id": "address_state",
                  "caption": "State",
                  "type": "text",
                  "value": "CA"
                },
                {
                  "name": "location_description",
                  "id": "location_description",
                  "caption": "If necessary, describe the location",
                  "type": "text",
                  "value": ""
                },
                {
                    "name":"ownership",
                    "id": "ownership",
                    "caption":"<h3>Ownership</h3><p>Do you own or take care of this tree?</p>",
                    "type":"radiobuttons",
                    "options" : {
                      "1" : "Yes",
                      "0" : "No"
                    }
              },
              {
                "type": "div",
                "name": "lemon_owner_data",
                "id" : "lemon_owner_data",
                "html" :[
                  {
                    "name":"sharing",
                    "caption":"<h3>Sharing</h3><p>Are you interested in sharing lemons?</p> You have many options on how to share your fruit. Select any that interest you. This will help people know the best way to interact with you.",
                    "type":"checkboxes",
                    "options" : {
                      "not_now": "<em>No</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-detail\">Not able to share lemons at this time.</span>",
                      "maybe": "<em>Maybe</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-detail\">Will share under the right social conditions</span>",
                      "sometimes": "<em>Sometimes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-detail\">Not always able to participate, but interested in sharing on occasion</span>",
                      "claimed": "<em>Sorry</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-detail\">Lemons are already claimed and put to use</span>",
                      "friends": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>For Friends</strong></span><span class=\"form-detail\">Lemons are available to friends only</span>",
                      "distribute": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Distribute</strong></span><span class=\"form-detail\">I bring lemons with me to community gatherings</span>",
                      "upick": "<em>Yes</em> <span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>U-PICK</strong></span><span class=\"form-detail\">Please come harvest the lemons</span>",
                      "glean": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Glean</strong></span><span class=\"form-detail\">I would like gleaners to come with ladders and cherry pickers to get lemons in hard to reach places.</span>",
                      "forage_pickup": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Forage Pickup</strong></span><span class=\"form-detail\">I would like to leave picked lemons out for pickup and redistribution through a foraging service to local food banks</span>",
                      "trade": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Trade</strong></span><span class=\"form-detail\">I am interested in sharing lemons for trade or barter</span>",
                      "supplier": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Supplier</strong></span><span class=\"form-detail\">I am interested in supplying local restaurants with lemons</span>",
                      "market": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Market</strong></span><span class=\"form-detail\">I would like my lemons to be sold at a Farmer's Market to benefit local organizations and provide people without lemons access to local lemons.</span>",
                      "store": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Store</strong></span><span class=\"form-detail\">I would like my lemons to be sold at the corner store</span>",
                      "neighbors": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Neighbors</strong></span><span class=\"form-detail\">I would like to share lemons with my neighbors who do not have lemon trees.</span>",
                      "source": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Source</strong></span><span class=\"form-detail\">I am interested in providing lemons for value-added products (such as preserves)</span>",
                      "pickup_appt": "<em>Yes</em><span class=\"form-image\"><img src=\"images/spacer.gif\" /></span><span class=\"form-label\"><strong>Pickup Appt</strong></span><span class=\"form-detail\">Please contact me to come get lemons</span>"
                    }
                  },
                  {
                      "name":"contact_name",
                      "caption":"<h3>Tree Contact Person Name</h3>",
                      "type":"text",
                      "placeholder":"E.g. Name"
                  },
                  {
                      "name":"contact_email",
                      "caption":"<h3>Tree Contact Person E-mail</h3><p>Privacy: Your e-mail address will not be sold or given to any other organizations.</p>",
                      "type":"text",
                      "placeholder":"E.g. name@example.com",
                      "validate":{
                          "email":true
                      }
                  },
                  {
                        "name":"lemon_services",
                        "caption":"<h3>Lemon Services</h3><p>We hope that Lemonopoly will boost visibility for the many organizations working to improve access to fresh fruit, foraging opportunities, public fruit tree data and information about growing healthy fruit trees.</p><p>Here are some organizations that are already building the local lemon economy.</p>",
                        "type": "div",
                        "html": [                          
                          {
                            "type":"checkboxes",
                            "name": "data_sharing",
                            "caption": "<h4>Public Fruit Tree Data</h4><p>We are working to improve maps of public fruit trees. A number of Bay Area cities already have efforts to make public fruit tree data accessible. May we share your tree information with the following organizations?</p>",
                            "options": {
                              "just_one_tree": "<em>Yes</em> <a href=\"http://justonetreesf.org\">Just One Tree</a> (San Francisco) ",
                              "friends_of_the_urban_forest": "<em>Yes</em> <a href=\"http://friendsofurbanforest.org\">Friends of the Urban Forest</a> (San Francisco)"
                            }
                          },
                          {
                            "type":"checkboxes",
                            "name": "foraging_sharing",
                            "caption": "<h4>Local Foraging Programs</h4><p>Many of the cities playing Lemonopoly already have urban foraging and gleaning programs. If you own your tree and indicate how you would like your fruit shared, select which program you would like to know about your tree and we <em>will</em> pass along your email address (periodically) so they may contact you.</p>",
                            "options": {
                              "village_harvest": "<em>Yes</em> <a href=\"http://villageharvest.org\">Village Harvest</a> (San Jose) ",
                              "forage_berkeley": "<em>Yes</em> <a href=\"http://forageberkeley.org\">Forage Berkeley</a> (Berkeley) ",
                              "forage_oakland": "<em>Yes</em> <a href=\"http://forageoakland.org\">Forage Oakland</a> (Oakland) ",
                              "forage_city": "<em>Yes</em> <a href=\"http://forageoakcity.org\">Forage City</a> (Mostly Oakland) "
                            }
                          } 
                        ]
                  }
                ]
              },
              {
                  "name":"lat",
                  "id":"lat",
                  "type":"hidden"
              },
              {
                  "name":"lon",
                  "id":"lon",
                  "type":"hidden"
              },
              {
                  "name":"approved",
                  "value":"0",
                  "type":"hidden"
              },
              {  
                "name": "date_death",
                "id": "date_death",
                "type": "hidden"
              },
              {
                  "name":"datasource",
                  "value":"http://lemonopoly.org",
                  "type":"hidden"
              },
              {
                "name": "species",
                "id": "species",
                "value": "Citrus x limon",
                "type": "hidden"
              },
              {
                  "name":"kind",
                  "value":"tree",
                  "type":"hidden"
              },
              {
                  "name":"sponsor",
                  "value":"http://lemonopoly.org",
                  "type":"hidden"
              },
              {
                  "name":"player_id",
                  "id":"player_id",
                  "type":"hidden"
              },
              {
                  "name":"art",
                  "value":"/images/icons/lemon_tree_icon.png",
                  "type":"hidden"
              }
            ]
        },
        {
            "type":"submit",
            "value":"Save"
        }
    ]
}
);
};

lemonopoly.claimFormLoad = function() {
  $('#claim-form').dform({
        "action": "/agent/save",
        "method": "post",
        "html":[
          {
              "type":"fieldset",
              "html":[
                    {
                      "name":"title",
                      "type":"hidden",
                      "value": "Lemon Claim"
                    },
                    {
                      "name":"who_played",
                      "caption": "<h3>Who Played?</h3>",
                      "type" : "div"
                    },
                    {
                      "name":"player_name",
                      "type" : "div"
                    },
                    {
                      "name":"who_team",
                      "caption": "<h3>Society</h3>",
                      "type" : "div"
                    },
                    {
                      "name":"teams_display",
                      "id": "teams_display",
                      "caption": "Which city will get credit for this?",
                      "type":"div"
                    }, 
                    {
                      "name":"teams",
                      "id": "teams",
                      "type":"select",
                      "multiple": "multiple",
                      "options": {
                        "team-0": "San Francisco", 
                        "team-1": "Oakland", 
                        "team-2": "Berkeley", 
                        "team-3": "San Jose"
                      }
                    },  
                    {
                      "name":"challenge_id",
                      "type":"select",
                      "options" : {
                        "id" : "Challenge"
                      }
                    },
                    {
                      "name":"how_lemony",
                      "caption": "<h3>How Lemony is this claim?</h3>",
                      "type" : "div"
                    },
                    {
                      "name":"number_lemons_involved",
                      "caption":"Lemon Quantity",
                      "type":"radiobuttons",
                      "options" : {
                          "a_few" : "A few",
                          "box" : "A box",
                          "truckload" : "A truckload"
                        }
                    },
                    {
                      "name":"story_label",
                      "caption": "<h3>Story</h3>",
                      "type" : "div"
                    },
                    {
                      "name":"notes",
                      "id": "notes",
                      "caption":"Story",
                      "type":"textarea"
                    },                  
                    {
                      "name":"proof_title",
                      "caption": "<h3>Prove your claim!</h3>",
                      "type" : "div"
                    },
                    {
                      "name":"proof",
                      "caption":"Show it. Submit a URL linking to some sort of media evidence of this claim.",
                      "type":"url",
                      "placeholder": "http://... Flickr, youTube, Instagram, Twitter, etc"
                    },
                    {
                        "name":"lat",
                        "id":"lat",
                        "type":"hidden"
  
                    },
                    {
                        "name":"lon",
                        "id":"lon",
                        "type":"hidden"
  
                    },
                    {
                        "name":"approved",
                        "value":0,
                        "type":"hidden"
                    },
                    {
                        "name":"quality_rating",
                        "value":0,
                        "type":"hidden"
                    },
                    {   
                        "name": "oembed_provider",
                        "id": "oembed_provider",
                        "type":"hidden"
                    },
                    {   
                        "name": "oembed_url",
                        "id": "oembed_url",
                        "type":"hidden"
                    },
                    {   
                        "name": "oembed_json_cache",
                        "id": "oembed_json_cache",
                        "type":"hidden"
                    },
                    {
                        "name":"challenge",
                        "id":"challenge",
                        "value": "",
                        "type":"hidden"
                    },
                    {
                        "name":"kind",
                        "value":"claim",
                        "type":"hidden"
                    },
                    {
                        "name":"sponsor",
                        "value":"http://lemonopoly.org",
                        "type":"hidden"
                    },
    
                    {
                        "name":"player_id",
                        "id": "player_id",
                        "type":"hidden"
                    },
                    {
                        "name":"player_name_store",
                        "id": "player_name_store",
                        "type":"hidden"
                    },
                    {
                        "name":"team_name_store",
                        "id": "team_name_store",
                        "type":"hidden"
                    },
                    {
                        "name":"art",
                        "value":"/images/icons/claim.png",
                        "type":"hidden"
                    },
                    {
                        "type":"submit",
                        "value":"Save"
                    }
              ]
          }
      ]
  });

};
