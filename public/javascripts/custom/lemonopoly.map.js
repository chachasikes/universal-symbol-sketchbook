var mm = com.modestmaps;
lemonopoly.map = {};
lemonopoly.map_claims = {};
lemonopoly.map_trees = {};
var markers = 0;
var map_features = {};

lemonopoly.gps_lat = 0;
lemonopoly.gps_lon = 0;
lemonopoly.gpsEvents = 0;



lemonopoly.setupClaimMap = function() {
  var watercolor = new MM.StamenTileLayer("watercolor");
  if(lemonopoly.binglayer === undefined){
    lemonopoly.binglayer = new MM.BingProvider("AtkOLOj428A8BMnYHFJXs_FlcnUE--SAuBY3sGaB_vrdnXIIUXQ2coJk6G3W1NZe", 'AerialWithLabels', function(){});
  }
  var satellite = new MM.Layer(lemonopoly.binglayer);
  lemonopoly.map_claims = new MM.Map("mini-map-claims-container", [satellite, watercolor]);

  if (lemonopoly.gps_lat !== 0 && lemonopoly.gps_lon !== 0) {
    lemonopoly.map_claims.setMapCenterZoom(lemonopoly.gps_lat, lemonopoly.gps_lon, 14, lemonopoly.map_claims);  
  }
  else {
    // try get away with only setting map once
    lemonopoly.map_claims.setCenter({ lat: 37.8, lon: -122.1 }).setZoom(10);
  }
  var zoomer = wax.mm.zoomer(lemonopoly.map_claims);
  zoomer.appendTo('mini-map-claims-container');
  
  lemonopoly.swapMapLayers(lemonopoly.map_claims);
  lemonopoly.layerToggleBindClick();
};

lemonopoly.setupTreeMap = function() {
  var watercolor = new MM.StamenTileLayer("watercolor");
  if(lemonopoly.binglayer === undefined){
    lemonopoly.binglayer = new MM.BingProvider("AtkOLOj428A8BMnYHFJXs_FlcnUE--SAuBY3sGaB_vrdnXIIUXQ2coJk6G3W1NZe", 'AerialWithLabels', function(){});
  }
  var satellite = new MM.Layer(lemonopoly.binglayer);
  lemonopoly.map_trees = new MM.Map("mini-map-trees", [satellite, watercolor]);

  if (lemonopoly.gps_lat !== 0 && lemonopoly.gps_lon !== 0) {
    lemonopoly.map_trees.setMapCenterZoom(lemonopoly.gps_lat, lemonopoly.gps_lon, 14, lemonopoly.map_trees);  
  }
  else {
    // try get away with only setting map once
    lemonopoly.map_trees.setCenter({ lat: 37.8, lon: -122.1 }).setZoom(10);
  }

  var zoomer = wax.mm.zoomer(lemonopoly.map_trees);
  zoomer.appendTo('mini-map-trees-container');

  
  lemonopoly.swapMapLayers(lemonopoly.map_trees);
  lemonopoly.layerToggleBindClick();
};

lemonopoly.setupMap = function() {
  $('#map-legend-mobile .layer-toggles').hide();
  $('#map-legend-mobile #show-legend').toggle(function(){$('#map-legend-mobile .layer-toggles').show();},function(){$('#map-legend-mobile .layer-toggles').hide();});

  var watercolor = new MM.StamenTileLayer("watercolor");
/*
  var terrain = new MM.StamenTileLayer("terrain");
  // If we cannot load the map for some reason then just use a default image
  if (watercolor === undefined) {
    var watercolor = new MM.Layer(new MM.MapProvider(function(coord) {
      var img = parseInt(coord.zoom) +'-r'+ parseInt(coord.row) +'-c'+ parseInt(coord.column) + '.jpg';
      return 'http://osm-bayarea.s3.amazonaws.com/' + img;
    }));
  }
*/

  if(lemonopoly.binglayer === undefined){
    lemonopoly.binglayer = new MM.BingProvider("AtkOLOj428A8BMnYHFJXs_FlcnUE--SAuBY3sGaB_vrdnXIIUXQ2coJk6G3W1NZe", 'AerialWithLabels', function(){});
  }
  var satellite = new MM.Layer(lemonopoly.binglayer);
  lemonopoly.map = new MM.Map("map-container", [satellite, watercolor]);
  
  if (navigator.geolocation){
    // listen to updates if any
    navigator.geolocation.watchPosition( function(position) {
      lemonopoly.gpsEvents++;
      lemonopoly.gps = position;
      if(lemonopoly.gpsEvents == 1) {
        lemonopoly.gps_lat = lemonopoly.gps.coords.latitude;
        lemonopoly.gps_lon = lemonopoly.gps.coords.longitude;
        lemonopoly.setMapCenterZoom(lemonopoly.gps.coords.latitude, lemonopoly.gps.coords.longitude, 10, lemonopoly.map);
      }
      Kernel.event("gps",position);
    });
  } else {
    // try get away with only setting map once
    lemonopoly.setMapCenterZoom(37.8,-122.1,12, lemonopoly.map);
  }

  // On map move events we want to requery the database to fetch features that the map is now over
  // map.addCallback('drawn', function() { 
  //   @TODO WRITE
  // });
  
  // make map pretty
  var zoomer = wax.mm.zoomer(lemonopoly.map)
  zoomer.appendTo('map-container');

  markers = new MM.MarkerLayer();
  lemonopoly.map.addLayer(markers);
  markers.parent.setAttribute("id", "markers");

  lemonopoly.map.addCallback('zoomed', function(m) {
    var zoomLevel = m.getZoom();
    if(zoomLevel < 8) {
      $('.marker[dataname="trees"] img').attr('src', '/images/icons/lemon_tree_icon_small.png');
    } 
    else if (zoomLevel <= 8 && zoomLevel >= 11) {
      $('.marker[dataname="trees"] img').attr('src', '/images/icons/lemon_tree_icon_small.png');  
    }
    else {
      $('.marker[dataname="trees"] img').attr('src', '/images/icons/lemon_tree_icon.png');
    }
  });

  // @TODO we shouldn't have to ask the kernel for data at all - the above 'drawn' callback should trigger the server to send us data for the map focus area
  // @TODO right now this kernel call merely hides access to server; but later we should actually consolidate this data into the real database
  // @TODO We also need the map paint logic to be able to render all the different types by itself - not just render trees
  // @TODO we should actually not set the map position until geo returns lat long
  // @TODO we should set radius
  // @TODO passing lat and lon of zero should act as if those are null

  lemonopoly.swapMapLayers(lemonopoly.map);
  lemonopoly.layerToggleBindClick();
  Kernel.query({"kind":"tree"},lemonopoly.repaint);
  Kernel.query2("raw/public_lemons",lemonopoly.paintTreeMarkers);
};


lemonopoly.setMapCenterZoom = function(lat,lon,zoom, map) {

  var map = map;
  var zoom = zoom;
  var lat = lat;
  var lon = lon;
  if(!map) return;
  if(map.setCenterZoom === undefined) {} else map.setCenterZoom(new MM.Location(lat,lon),zoom);
};

lemonopoly.swapMapLayers = function(map) { 
  var map = map;  
  $('.satellite').toggle(
  function(){ 
    $(this).html('Show Pretty Map'); 
    map.swapLayersAt(0, 1);
    var stamenAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.';
/*     $('#map-outer-container .attribution').html(stamenAttribution); */ // this breaks the map
  },
  function(){ 
    $(this).html('Show Satellite Map'); 
    map.swapLayersAt(0, 1);
    var bingAttribution = "Map tiles by Bing";
/*     $('#map-outer-container .attribution').html(bingAttribution); */
  });
};

lemonopoly.layerToggleBindClick = function() {
  Kernel.query2("raw/farmers_markets",lemonopoly.paintMarketMarkers);
      $('.farmers-market-marker').hide();
      
  $('li.farmers_markets').toggle(function(){lemonopoly.layerTogglesActivate('farmers_markets')},function(){lemonopoly.layerTogglesDeactivate('farmers_markets')});
  $('li.zipcodes').toggle(function(){lemonopoly.layerTogglesActivate('zipcodes')},function(){lemonopoly.layerTogglesDeactivate('zipcodes')});
  $('li.neighborhoods').toggle(function(){lemonopoly.layerTogglesActivate('neighborhoods')},function(){lemonopoly.layerTogglesDeactivate('neighborhoods')});
  $('li.lemons').toggle(function(){lemonopoly.layerTogglesActivate('lemons')},function(){lemonopoly.layerTogglesDeactivate('lemons')});

/*   $('li.satellite').click(function(){lemonopoly.layerTogglesActivate('satellite')}); */
};

lemonopoly.layerTogglesActivate = function(target) {
  switch(target){
    case 'farmers_markets':
          $('.farmers-market-marker').show();

      break;
    case 'zipcodes':
/*       Kernel.query2("raw/societies",lemonopoly.paintInfoMarkers); */
      break;  
    case 'neighborhoods':
/*       Kernel.query2("raw/societies",lemonopoly.paintInfoMarkers); */
      break
    case 'lemons':
/*       Kernel.query2("raw/societies",lemonopoly.paintInfoMarkers); */
      break
    default:
      break;
  }

}

lemonopoly.layerTogglesDeactivate = function(target) {
  switch(target){
    case 'farmers_markets':
/*       //console.log("deactivate fm"); */
      $('.farmers-market-marker').hide();
/*       Kernel.query2("raw/farmers_markets",lemonopoly.paintMarketMarkers);     */
      break;
    case 'zipcodes':
/*       Kernel.query2("raw/societies",lemonopoly.paintInfoMarkers); */
      break;  
    case 'neighborhoods':
/*       Kernel.query2("raw/societies",lemonopoly.paintInfoMarkers); */
      break
    case 'lemons':
/*       Kernel.query2("raw/societies",lemonopoly.paintInfoMarkers); */
      break
    default:
      break;
  }

}

lemonopoly.mapUpdate = function(map) {
console.log("mapupdate");
  // Load map.
  // force redraw by rezooming to the current zoom level - since map does not load when page loads if the tab is hidden. most of the map is set up, it just needs to be redrawn. can't find a redraw function in modest maps.
  var map = map;

  if (lemonopoly.gps_lat !== 0 && lemonopoly.gps_lon !== 0) {
    lemonopoly.setMapCenterZoom(lemonopoly.gps_lat, lemonopoly.gps_lon, 14, map);  
  }
  else {
    // try get away with only setting map once
    map.setCenter({ lat: 37.8, lon: -122.1 }).setZoom(10);
  }

  if((player_id === 0 || player_id === undefined) && lemonopoly.localData.profile === undefined) {
    //console.log("not logged in");
    $('a.map-tree').click(lemonopoly.loginPrompt);
  }
  else if(player_id !== 0 && player_id !== undefined && lemonopoly.localData.profile === undefined) {
    //console.log("no profile");
    $('a.map-tree').click(lemonopoly.profilePrompt);
  }
  else{
    $('a.map-tree').attr('data-toggle', 'tab');
    $('a.map-tree').attr('href', '#add-tree');
    lemonopoly.rebindAddresses();
  }
       
  map.requestRedraw();
};


lemonopoly.makeTreeMarker = function(feature) {

  var id = feature.properties.id;
  var marker = document.createElement("div");
 
  var treeString = '';
  treeString += "<h2>" + feature.properties.title + "</h2>";
  if(feature.properties.address_street !== undefined) {
    treeString += "<h3><strong>" + feature.properties.address_street + "</strong></h3>";
  }
  
  var properties = feature.properties;
  
  treeString += "<hr>";

  if(properties.tree_owner !== undefined) {

    treeString += "<p>Tree Owner <strong>" + properties.tree_owner + "</strong></p>";
  }

  if(properties.stewardship !== undefined) {
    treeString += "<p>Stewardship <strong>" + lemonopoly.loadTreeStewardship(properties.stewardship) + "</strong></p>";
  }  

  if(properties.variety !== undefined) {
    treeString += "<p>Variety <strong>" + lemonopoly.loadTreeNames(properties.variety) + "</strong></p>";
  }   

  if(properties.quantity !== undefined) {
    treeString += "<p>Quantity <strong>" + properties.quantity + "</strong></p>";
  } 

  if(properties.description !== undefined) {
    treeString += "<p>Description <strong>" + properties.description + "</strong></p>";
  } 

  if(properties.steward_name !== undefined || properties.contact_name !== undefined) {
    treeString += "<p>Steward Name <strong>" + properties.contact_name + "</strong></p>";
  }

  if(properties.datasource !== undefined) {
    treeString += "<p>Data Source <strong>" + properties.datasource + "</strong></p>";
  }

  if(properties.last_updated !== undefined) {
    treeString += "<p>Last Updated <strong>" + properties.last_updated + "</strong></p>";
  }
  
  marker.feature = feature;
  markers.addMarker(marker, feature);

  // Unique hash marker id for link
  marker.setAttribute("id", "marker-" + id);
  marker.setAttribute("dataName", "trees");
  marker.setAttribute("class", "marker");
      
  //@TODO this is probably wrong
  // marker.setAttribute("href", vars.callbackPath + id);

  // Specially set value for loading data.
  marker.setAttribute("marker_id", id);

  // create an image icon
  var img = marker.appendChild(document.createElement("img"));
  img.setAttribute("src", "/images/icons/lemon_tree_icon.png");  

  // Tooltips
  $("#marker-" + id + " img").qtip({
  	content: {
      text: treeString,
  	},
  	hide: {
  		delay: 100,
  		when: { event: 'inactive' }
  	},
  	position: {
  		my: 'middle left', 
  		at: 'bottom middle',
  		adjust: {
  			x: 20,
  			y: -10
  		}
  	},
  	style: { 
  		tip: true,
  		classes: 'ui-tooltip-dark'
  	},
  	tip: {}
  });

  $('a[title]').qtip();

  // Listen for mouseover & mouseout events.
  MM.addEvent(marker, "mouseover", lemonopoly.onMarkerOver);
  MM.addEvent(marker, "mouseout", lemonopoly.onMarkerOut);
  MM.addEvent(marker, "click", lemonopoly.onMarkerClick);



}

lemonopoly.makeMarketMarker = function(feature) {

  var id = feature.properties.id;
  var marker = document.createElement("div");
 
  var markupString = '';
  markupString += "<h2>" + feature.properties.title + "</h2>";

  if(feature.properties.url !== undefined && feature.properties.url !== null ) {
    markupString += '<p><a href="' +  feature.properties.url + '">Website</a></p>';
  }
  
  marker.feature = feature;
  markers.addMarker(marker, feature);

  // Unique hash marker id for link
  marker.setAttribute("id", "marker-" + id);
  marker.setAttribute("type", "market");
  marker.setAttribute("dataName", feature.properties.title);
  marker.setAttribute("class", "farmers-market-marker");

  // Specially set value for loading data.
  marker.setAttribute("marker_id", id);

  // create an image icon
  var img = marker.appendChild(document.createElement("img"));

  if(feature.art) {
    img.setAttribute("src", feature.art );
  } else {
    img.setAttribute("src", "/images/icons/farmers_market.png");
  }
  
  $('a.add-tree').unbind(clickEvent, lemonopoly.loginPrompt);
  $('a.add-tree').unbind(clickEvent, lemonopoly.profilePrompt);

  $('a.add-tree').click(function(){
    var mapCenter = map.center();
    $('input#lat').val(mapCenter.lat);
    $('input#lon').val(mapCenter.lon);
  });
  
  // Tooltips
  $("#marker-" + id + " img").qtip({
	content: {
    text: markupString,
	},
	hide: {
		delay: 1500
	},
	position: {
		my: 'middle left', 
		at: 'bottom middle',
		adjust: {
			x: 20,
			y: -10
		}
	},
	style: { 
		tip: true,
		classes: 'ui-tooltip-dark'
	},
	tip: {}
  });

  $('a[title]').qtip();

  // Listen for mouseover & mouseout events.
  MM.addEvent(marker, "mouseover", lemonopoly.onMarkerOver);
  MM.addEvent(marker, "mouseout", lemonopoly.onMarkerOut);
  MM.addEvent(marker, "click", lemonopoly.onMarkerClick);
}

lemonopoly.makeInfoMarker = function(feature) {

  var id = feature.properties.id;
  var marker = document.createElement("div");
 
  var markupString = '';
  markupString += "<h2>" + feature.properties.kind + ": " + feature.properties.title + "</h2>";

/*   markupString += "<p>Population in zipcode: " + feature.properties.zipcode_population + "</p>"; */
/*   markupString += "<p>Land area, square miles: " + feature.properties.land_area_square_miles + "</p>"; */
/*   markupString += "<p>Water area, square miles: " + feature.properties.water_area_square_miles + "</p>"; */
/*   markupString += "<p>Population Density, people per square mile: " + feature.properties.population_density_sq_mi + "</p>"; */

/*   markupString += "<p>Media House Value, 2010: " + feature.properties.median_house_price + "</p>"; */
  markupString += "<p>" + feature.properties.city + "</p>";

  markupString += "<p>Datasource http://city-data.com</p>";


  marker.feature = feature;
  markers.addMarker(marker, feature);

  // Unique hash marker id for link
  marker.setAttribute("id", "marker-" + id);
  marker.setAttribute("type", "market");
  marker.setAttribute("dataName", feature.properties.title);
  marker.setAttribute("class", "marker");

  // Specially set value for loading data.
  marker.setAttribute("marker_id", id);

  // create an image icon
  var img = marker.appendChild(document.createElement("img"));

  if(feature.art) {
    img.setAttribute("src", feature.art );
  } else {
    img.setAttribute("src", "/images/icons/information-icon.png");
  }

  // Tooltips
  $("#marker-" + id + " img").qtip({
	content: {
    text: markupString,
	},
	hide: {
		delay: 1500
	},
	position: {
		my: 'middle left', 
		at: 'bottom middle',
		adjust: {
			x: 20,
			y: -10
		}
	},
	style: { 
		tip: true,
		classes: 'ui-tooltip-dark'
	},
	tip: {}
  });

  $('a[title]').qtip();

  // Listen for mouseover & mouseout events.
  MM.addEvent(marker, "mouseover", lemonopoly.onMarkerOver);
  MM.addEvent(marker, "mouseout", lemonopoly.onMarkerOut);
  MM.addEvent(marker, "click", lemonopoly.onMarkerClick);
}

lemonopoly.paintTreeMarkers = function(features) {
  lemonopoly.localData.trees_public = features;

  features = features.features;
  var len = features.length; 
  for (var i = 0; i < len; i++) {
    var feature = features[i];
    lemonopoly.makeTreeMarker(feature);
  }
};

lemonopoly.paintMarketMarkers = function(features) {
  features = features.features;
  var len = features.length; 
  for (var i = 0; i < len; i++) {
    var feature = features[i];
    lemonopoly.makeMarketMarker(feature);
  }
};

lemonopoly.paintInfoMarkers = function(features) {
  features = features.features;
  var len = features.length; 
  for (var i = 0; i < len; i++) {
    var feature = features[i];
    lemonopoly.makeInfoMarker(feature);
  }
};


lemonopoly.repaint_agent = function(agent) {

  // ignore elements that do not have an id
  var id = agent._id;
/*   if(!id) continue; */ // @TODO this statement has an error: 'continue' is only valid inside a loop statement

  // ignore agents that are on map already
  // later we want to carefully prune them off if off screen @TODO
/*   if(map_features[id]) continue; */ // @TODO this statement has an error: 'continue' is only valid inside a loop statement

  // ignore features with no location
  // @TODO later carefully remove features without location if had location before 

  var lat = agent.lat;
  var lon = agent.lon;
/*   if(!lat || !lon) continue; */ // @TODO this statement has an error: 'continue' is only valid inside a loop statement
 
  var title = agent.title;
  if(!title) title = "Lemon Tree";

  var art = agent.art;
  if(!art) art = "/images/icons/lemon_tree_icon_small.png";

  // console.log("repainting agent " + id + " " + lat + " " + lon + " " + title );

  var feature = {
    "id":id,
    "type":"Feature",
    "art":art,
    "geometry": { "type":"Point", "coordinates": [lon,lat] },
    "properties": {
      "longitude" : lat,
      "latitude" : lon,
      "title" : title,
      "id" :  id
    }
  };
  
  feature.properties = agent;
  map_features[id] = feature;
  lemonopoly.makeTreeMarker(feature);
}

lemonopoly.repaint = function(agents) {
  if(!map) return;
  for(var key in agents) {
    lemonopoly.repaint_agent(agents[key]);
  }
}

lemonopoly.getMarker = function(marker) {
  while (marker && marker.className != "marker") {
    marker = marker.parentNode;
  }
  return marker;
};

lemonopoly.onMarkerOver = function(e) {
  var marker = lemonopoly.getMarker(e.target);
  if (marker) {
    var marker_id = $(this).attr('marker_id');
    var layer = $(marker).attr("parent");
    // $('div.marker').css({ 'opacity' : 0.4 }); 
    // make something pretty now!
  }
};

lemonopoly.onMarkerOut = function(e) {
  var marker = lemonopoly.getMarker(e.target);
  var layer = $(marker).attr("parent");
  if (marker) {
    // var type = marker.type; 
    // $('div.marker').css({ 'opacity' : 1 }); 
  }
  return false;
};

lemonopoly.onMarkerClick = function(e) {
  var marker = e.target.offsetParent;
  // lemonopoly.popupMarker(marker);
  var marker = lemonopoly.getMarker(e.target);
  if (marker) {
    $('div#panel-container div#panel .content').show();
    // make something pretty
  }
  return false;
};

