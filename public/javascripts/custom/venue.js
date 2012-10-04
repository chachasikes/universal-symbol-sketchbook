
function Venue(title){ 
	this.title=title;
	this.kind="Venue";
} 
Venue.inheritsFrom(Agent);
Venue.prototype.createInstance=function(){ 
	var thing = this.parent.createInstance.call(this);
	return thing;
} 
Venue.prototype.toString=function(){ 
	return '[Venue "'+this.title+'"]';
} 


