///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Kernel data services
//
// 1) We treat game state between clients and servers as a database synchronization problem.
//    The client and server are both supposed to reflect the same state, with the server being authoritative.
//
// 2) We use a free form database format on the server ( mongo in this case ) that allows dynamic object properties.
//    All objects are stored in ONE table; they are differentiated by a "kind" field in the object.
//
// 3) We use a beefy base class paradigm where almost all objects have the same set of core properties.
//    This means sometimes there are unused fields in objects.
//
// 4) The use pattern is that you make a blob yourself in javascript and push to the server; the server sends it back.
//    When you get it back from the server it will now have an _id. This is an asynchronous event - design accordingly.
//    You can push any blob to the server - the server is data agnostic
//
// 5) There is no formal schematized OOPS type system right now. One may be introduced as a helper, but raw json blobs should always be ok.
//    There is a temptation to introduce real objects with schemas and inheritance; this may be available at some point as as service.
//
// 6) The collection of all kinds of objects together make up a "game". The interactions of these objects are done server side.
//
// 7) See agent.js. The core database actually operates below the level of objects but will make of the specified kind if possible.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Kernel() { };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Kernel event listener utility
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Kernel.eventListeners = {};

Kernel.addListener = function(filter,callback) {
  if(!filter || !callback) return;
  var members = Kernel.eventListeners[filter];
  if(!members) members = [];
  members.push(callback);
  Kernel.eventListeners[filter] = members;
}

Kernel.event = function(filter,target) {
  //console.log("kernel:: event called with filter " + filter);
  if(!filter)return;
  var members = Kernel.eventListeners[filter];
  if(!members || !members.length) return;
  for(var i = 0; i < members.length; i++) {
    var mycallback = members[i];
    mycallback(filter,target);
    //console.log("kernel:: calling event handler for filter " );
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Internal handle on data managed by the system; should not be used by external code
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Kernel.prototype.data = {};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Given an entity, add it to the local database; overriding the same _id.
// Entity MUST have a globally unique id; typically this means it must have come from server.
// Do not push to server { however may mark as dirty for later server state synchronization }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Kernel.save_local = function(agent) {

  // paranoia checks
  if(!agent) return;
  if(!agent._id) return;

  if(!agent.lat || !agent.lon) { agent.lat = agent.lon = 0; };
  if(!agent.icon)  agent.icon = "/images/icons/spacer.gif";
  if(!agent.title)  agent.title = "untitled";
  if(!agent.kind)  agent.kind = "agent";

  agent.visible = true;
  agent.dirty = true;

  var id = agent["_id"];

  // save!
  Kernel.prototype.data[id] = agent;
}

Kernel.query_local = function(filter) {
  if(!filter || !filter.length) return [];
  var results = [];
  for(var key in Kernel.prototype.data) {
    var agent = Kernel.prototype.data[key];
    var match = 0;
    for(var fkey in filter) {
      if( agent[fkey] != filter[fkey]) { match = 0; break; } 
    }
    if(match) results.push(agent);
  }
  return results;
}; 

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Save to server 
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
// Save to server
// Like all callbacks this callback system returns a LIST of results NEVER a single item
// If database failed to save the callback will be called with []
//

Kernel.save = function(agent,callback) {

  // @TODO accept raw and processed types - right now only accepts raw
  // agent = Kernel.mulch(agent);

  //console.log("Kernel::save got request to save: " );
  //console.log(agent);
  
  var mylisteners = Kernel.prototype.listeners;
  var mycallback = callback;
  $.post('/agent/save', agent, function(results) {
    //console.log("kernel:: got save response of " + results);
    if(!results) { if(mycallback)mycallback([]); return; }
    if (typeof results === "undefined") { if(mycallback)mycallback([]); return; }
    // visit result set and save each one
    //console.log("kernel:: save got some results " + results);
    //console.log(results);
    var saved_set = [];
    for(var i in results) {
      //console.log("kernel:: processing item " + i);
      var blob = results[i];
      //console.log("kernel got item " + blob );
      //console.log(blob);
      //console.log("kernel got the item id of " + blob._id );
      Kernel.save_local(blob);
      saved_set.push(blob);
    }
    // call callback with result set ( almost always just a single member )
    if(mycallback) {
      mycallback(saved_set);
    }
    // notify listeners
    //console.log("kernel::save notifying listeners");
    if(mylisteners) {
      for(var key in mylisteners) {
        var listener = mylisteners[key];
        listener(saved_set);
      }
    }
    //console.log("kernel::save done saving");
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Destroy
// @TODO at bulk destroy
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Kernel.destroy = function(agent,callback) {
  //console.log("kernel:: destroy " );
  //console.log(agent);
  $.post('/agent/destroy', agent, callback);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Query - goes to server
// Query for things by criteria
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Kernel.prototype.agent_updating = false;

Kernel.query_callback = function(results,mycallback) {

  // any data?
  //console.log("kernel::query:: json call done " + results.length );

  if(!results) {
    //console.log("kernel::query BADNESS got nothing!");
    if(mycallback)mycallback([]);
    return;
  }

  if (typeof results === "undefined") {
    //console.log("kernel::query BAD ERROR got nothing 2!");
    if(mycallback)mycallback([]);
    return;
  }

  if(results.length < 1) {
    //console.log("kernel::query got empty set back from server");
    if(mycallback)mycallback([]);
    return;
  }

  // aside from saving all incoming objects to the database, a subset of them may be callback passed to caller

  var filtered_set = [];

  // cache any new data locally (overwriting existing)

  for(var i in results) {
    var agent = results[i];
/*
    //console.log("Kernel::query got :");
    //console.log(agent);
*/
    if(!agent) {
      //console.log("kernel::query BAD ERROR! skipping empty candidate");
      continue;
    }
    if (typeof agent === "undefined") {
      //console.log("kernel::query BAD ERROR! skipping corrupt candidate");
      continue;
    }
    var id = agent["_id"];
    if(!id) {
      //console.log("kernel::query BAD ERROR! skipping candidate since it has no id");
      continue;
    }

    // mark as visible

    agent.visible = true;
      
    Kernel.save_local(agent);

    //console.log("kernel::query result ");
    //console.log(agent);

    filtered_set.push(agent);
 
  }

  // Pass matching candidates back to the caller
  // @TODO it was supposed to pass back an array but is passing back a hash

  mycallback(filtered_set);

};

//
// General purpose query
// This may talk to the server if it needs to
// Builds local cache copy of any state synchronized with server
// If you pass a filter it will only return results matching the filter
// Will call your callback at least ONCE even if no data
// Will ALWAYS return a collection NEVER an individual item
//
Kernel.query = function(filter,callback) {

  if(!filter || !callback) {
   // console.log("Kernel::query called with bad arguments");
    return;
  }

  //console.log("Kernel::query called with this filter: ");
  //console.log(filter);
  var jsonblob = JSON.stringify(filter);
  //console.log(jsonblob);

  var mycallback = callback;
  var myurl = "/agent/query";

  $.post(myurl, filter , function(results) { Kernel.query_callback(results,mycallback); } );

  return;

  $.ajax(myurl, {
    type: 'POST',
    data: jsonblob,
    contentType: 'text/json',
    success: function(results) { Kernel.query_callback(results,mycallback); },
    error  : function() { Kernel.query_callback([],mycallback); }
  });

  // $.getJSON(myurl, function(results) { mycallback(results); });

};

Kernel.stats = function(filter,callback) {
  //console.log("stats");
  if(!filter || !callback) {
    //console.log("Kernel::query called with bad arguments");
    return;
  }

  //console.log("Kernel::query called with this filter: ");
  //console.log("filter");
  //console.log(filter);
  var jsonblob = JSON.stringify(filter);
  //console.log(jsonblob);

  var mycallback = callback;
  var myurl = "/agent/stats";

/*
  $.get(myurl, filter, function(results) { 
    //console.log(results);
  Kernel.query_callback(results,mycallback); } );
  //console.log("stats2");
  return;
*/

/*
  $.ajax(myurl, {
    type: 'GET',
    data: jsonblob,
    contentType: 'text/json',
    success: function(results) { Kernel.query_callback(results,mycallback); },
    error  : function() { Kernel.query_callback([],mycallback); }
  });
*/

  $.getJSON(myurl, function(results) { mycallback(results); });

};

//
// Temporary code
// For now the mapping engine is statically loading some assets
// Later we want to convert these assets into real database objects
// The map should then later on just fetch any data in the geographic area of interest
// So this entire function should be removable at that time
// Returns entire set in callback
//

Kernel.query2 = function(filename,callback) {
  $.ajax({
    url: "/data/"+filename+".json",
    dataType: 'json',
    success: callback,
    error: function(error) { console.log("Kernel::query2 error! " + error); console.log(error); return false; }
  });
}

