
///////////////////////////////////////////////////////////////////////////////////// 
// Internal prototype Helper
// http://phrogz.net/js/classes/OOPinJS2.html
///////////////////////////////////////////////////////////////////////////////////// 

Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) { 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else { 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
} 

///////////////////////////////////////////////////////////////////////////////////// 
// Abstract base
///////////////////////////////////////////////////////////////////////////////////// 

Thing = { createInstance : function(){ } } 

///////////////////////////////////////////////////////////////////////////////////// 
// Agent
///////////////////////////////////////////////////////////////////////////////////// 

// Agent
//
// The client side database returns first class objects using a javascripty approximation of object oriented programming.
// Agent represents the base of entities that have location and presentation; trees, people, places, challenges etcetera

function Agent(title) {
	this._id = "";			// mongo grants this to us at server end
	this.kind = "Agent";		// we can grant ourselves any unique label here
	this.subkind = "";		// we can grant ourselves any unique label here
	this.sponsor_id = "";		// parent - we do not directly simply have an array of children - we want a looser decoupled architecture
	this.title = title;		// title 
	this.art = "";		// an url
	this.description = "";
	this.lat = 0.0;
	this.lon = 0.0;
	this.moved = 0;
	this.visible = 1;		// visible on maps and stuff
	this.dirty = 1;			// mark as dirty if not sent to server yet
	this.created_at = 0;
	this.updated_at = 0;
	this.player_id = 0;  // don't know if this is necessary (- chach)
	this.challenge_id = 0; // don't know if this is necessary (- chach)

	// An example of how to build private functions
	//
	// function MyPrivateFunction() { }
	//
	// An example of how to build private variables
	//
	// var MyPrivateVariable = 0;
	//
	// an example of methods with local private variables
	//
	// this.MyPublicMethod = function() { return MyPrivateVariable; }
}
Agent.MyStaticPublicVariableExample = "example";
Agent.inheritsFrom( Thing );
//Agent.prototype.createInstance=function(){ 
//	this.parent.createInstance.call(this);
//	var thing = new this.constructor("Agent");
//	return thing;
//}
Agent.prototype.toString=function(){ 
	return '[Agent "'+this.title+'"]';
} 



