#API

* Examples of json data that will be loaded from the API.
* Content generated by users through forms.

## ----Challenge Statuses-------------------------------------------------------
These are buttons on the #challenges page that allow a player to flag a challenge.

--------status -------------
- WORKS                           NO!!!! // player_id not set. breaks everything. -- forced with manually settings player_id.
- JSON structure documented:      YES
- template set up:                YES
- JSON structure correct:         YES
- Form correct:                   YES
- saves to db:                    YES
- reads from db:                  YES
- status can be removed:          NO!! // because Kernel.destroy is not written
- displays even w/ display none:  DISCONNECTED // because the element is shown and is not set to display none
- Display correct - raw           YES -- (but only if the player_id is available)
- Display correct - api           NO // not if profile loads -- conflict (probably in template markup index.html)
- loads challenge for profile:    NO -- not written
- loads challenge accept count:   NO -- not written 
- json from db loads via post     YES
- displays even if profile loads  NOT REALLY
- shows login not logged in       YES // this is just an alert

### TESTS
- logged in player clicks 'i want to do this': button changes, object is saved to db
- logged in player loads challenges page: i want to do this buttons are updated by player id, loads from database, user clicks button, data saves again
- logged in player can load their selected challenge statuses on their profile page
- challenges page shows how many players have flagged challenge
- saves one record per challenge id per player
- loads information for the correct player
-- remove works


### FORM LOCATION
There is no form, this is run by an ajax call

### OBJECT STRUCTURE
------------mongo
{ 
  "kind" : "challenge_status", 
  "title" : "Challenge Accepted",
  "player_id": "50290e35a5dd020000000001",
  "challenge_id": "challenge-0",
  "created_at" : ISODate("2012-08-17T03:36:59.661Z"), 
  "updated_at" : ISODate("2012-08-17T03:36:59.661Z"), 
  "_id" : ObjectId("502dbc5b585bbd0000000001")
}

------------raw
{ 
  "kind" : "challenge_status", 
  "title" : "Challenge Accepted",
  "player_id": "50290e35a5dd020000000001",
  "challenge_id": "challenge-2",
  "created_at" : "2012-08-17T03:36:59.661Z", 
  "updated_at" : "2012-08-17T03:36:59.661Z", 
  "_id" : "502dbc5b585bbd0000000001"
}







## --------PLAYER --------------------------------------------------------------
 
* The _id is the player_id


#### ------- Mongo version
{ "kind" : "Player", 
  "title" : "Chacha Sikes",
  "art" : "http://graph.facebook.com/551131745/picture", 
  "visible" : "1", 
  "dirty" : "1", 
  "fbid" : "551131745", 
  "created_at" : ISODate("2012-08-18T00:26:44.684Z"), 
  "updated_at" : ISODate("2012-08-18T00:26:44.684Z"), 
  "_id" : ObjectId("502eda63bfac1fc62a000001")
}

####

{ "kind" : "Player", 
  "title" : "Chacha Sikes",
  "art" : "http://graph.facebook.com/551131745/picture", 
  "visible" : "1", 
  "dirty" : "1", 
  "fbid" : "551131745", 
  "created_at" : "2012-08-18T00:26:44.684Z", 
  "updated_at" : "2012-08-18T00:26:44.684Z", 
  "_id" : "502eda63bfac1fc62a000001"
}



### TESTS
- art saves correctly?                    NO?
- loads player                            YES
- updates player from fb                  YES
- sets fbid                               YES
- sets fb pic                             YES
- displays player info                    YES
- challenge statuses work                 YES
- profile works                           YES
- team works                              YES
- api example exists                      NO



## ----------------------- Profile ---------------------------------------------

### TESTS
-- interests is done:                     NO
-- roles is done:                         NO
-- path load #profile-edit:               YES // This and other forms have to wait for player_id to be set
-- display if no profile shows link:      NO  // Code escaped, but doesn't work.
-- profile form is correct:               YES // more or less, needs some content redesign
-- profile form saves:                    YES // Yes
-- profile form redirects correctly:      NO  // goes to /agent/save
-- profile displays correctly:            NO  // Yes, but needs challenge statuses and claims and teams
-- profile includes accepted-challenges:  NO
-- profile shows claims:                  NO
-- profile shows team:                    NO 
-- profile loads data -- raw              YES
-- profile loads data -- api              YES
-- any profile loads data -- raw          NO // Need to decide how to pass references to player -- by ID?
-- any profile loads data -- api          NO
-- object structure done:                 YES
-- user can see type case in form         NO // Need to change input font to one w/ both cases.
-- loads even if other tab selected       MAYBE not - interferes with challenge -- breaks js, can't tell why.
-- edit profile buttons load profile-edit YES
-- edit profile loads current content     NO // not written
-- loads team data                        NO
-- team button connects with tab history  NO // tried adding load address but it is not happy.
-- TEAMS ARE MERGED WITH PROFILE NOW      YES
-- profile.team                           NO -- strangely not appaearing but saved in db and in object right before rendering
-- profile.neighborhood                   NO -- strangely not appaearing but saved in db and in object right before rendering

### object structure

[
{
title: "Chach",
zipcode: "94703",
player_interest: [
"have_tree",
"tree_outreach",
"value_added_services",
"gleaner"
],
player_roles: [
"park_ranger",
"lemonaid_worker"
],
team: "San Jose",
neighborhood: "Alamo Square",
lat: "37.8700959",
lon: "-122.2771955",
kind: "profile",
sponsor: "0",
icon: "0",
player_id: "",
created_at: "2012-08-18T23:36:52.188Z",
updated_at: "2012-08-18T23:36:52.188Z",
_id: "5030271483db64d6ca000003"
}
]


# -------------------- TEAMS ---------------------------------------------------

### TESTS
-- MERGED WITH PROFILE!! ---------------------
-- path load #team:                       N0 // This and other forms have to wait for player_id to be set
-- team form is correct when it loads     NO // more or less, needs some content redesign & use teams from new json document would be better for saving w/ team-id
-- team form saves correctly              NO // missing player id
-- team form redirects correctly:         NO  // goes to /agent/save
-- displays correctly                     NO  // should become part of the profile display
-- loads data -- raw                      NO
-- loads data -- api                      NO
-- any team loads data -- raw             NO // not written
-- any team loads data -- api             NO // not written
-- object structure done:                 NO // will be simplified for neighborhoods/teams while still keeping validation
-- loads even if other tab selected       NO
-- team can be edited                     NO
-- team display if team exists            NO -- may move to profile
-- loaded by profile and returned         NO
-- form loads correctly                   NO


#------------------------------ CLAIMS -----------------------------------------


TESTS
Loads:                          NO
Data Structure Done:            MAYBE
Raw example Done:               YES
Load function done:             NO
Template done:                  NO
oembed integration:             NO



{
  "id" : "claim-0",
  "kind" : "claim",
  "challenge_id" : "challenge-76",
  "title" : "Heather playing Lemon Golf in Berkeley",
  "url" : "http://www.flickr.com/photos/linepithemate/7770766412/in/set-72157631042198134",
  "players" : {"503025ea83db64d6ca000001": "Chach", "502ee4ce8c0533382e00000d": "Heather"},
  "notes" : "This was fun!!",
  "number_lemons_involved" : 1,
  "number_participants" : 5,
  "lat" : 37.8729055333109,
  "lon" : -122.278035879135,
  "date" : "8/12/2012",
  "groups" : "Berkeley, Oakland, 94703, San Carlos, San Mateo, San Francisco",
  "groups_json" : ["Berkeley"," Oakland"," 94703"," San Carlos"," San Mateo"," San Francisco"],
  "approved" : 1,
  "quality_rating" : null,
  "number_likes" : null,
  "oembed_provider" : "flickr",
  "oembed_url" : "http://www.flickr.com/services/oembed?url=http://www.flickr.com/photos/linepithemate/7770766412/in/set-72157631042198134&format=json",
  "oembed_json_cache" : {"type":"photo","title":"Lemon golf","author_name":"linepithomatic","author_url":"http:\/\/www.flickr.com\/photos\/linepithemate\/","width":"1024","height":"768","url":"http:\/\/farm9.staticflickr.com\/8443\/7770766412_e705dfccc4_b.jpg","web_page":"http:\/\/www.flickr.com\/photos\/linepithemate\/7770766412\/","thumbnail_url":"http:\/\/farm9.staticflickr.com\/8443\/7770766412_e705dfccc4_s.jpg","thumbnail_width":75,"thumbnail_height":75,"web_page_short_url":"http:\/\/flic.kr\/p\/cQFd8f","license":"All Rights Reserved","license_id":0,"version":"1.0","cache_age":3600,"provider_name":"Flickr","provider_url":"http:\/\/www.flickr.com\/"},
  "oembed_rendered" : null,
  "featured" : null
}



================= TREES ===============================
(a record for a new tree)

==================== LOG =====================
(this is everything)