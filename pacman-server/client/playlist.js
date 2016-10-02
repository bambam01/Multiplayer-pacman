var player = require('./player.js');
var logger = require('../util/logger');

//main method
function playlist () {
	//list of all players and properties
	this.players = [];
	//orderd list of pac_id's of the players who are next in line
	this.pqueue = [];
	this.gqueue = [];
	this.player1 = "";
	this.player2 = "";


}

//retun player with the given pac_id else return false
playlist.prototype.getPlayerByPac_id = function(pac_id) {
	if(pac_id in this.players){
		return this.players[pac_id];
	}else{
		return false;
	}
};

playlist.prototype.disconnect = function(pac_id) {
	if(pac_id in this.players){
		this.players[pac_id].disconnect = true;
	}
};

playlist.prototype.reconnect = function(pac_id) {
	if(pac_id in this.players){
		 this.players[pac_id].disconnect = false;
	}
};

playlist.prototype.isDisconnected = function(pac_id) {
	if(pac_id in this.players){
		return this.players[pac_id].disconnect;
	}
};


playlist.prototype.setPlayerSocket = function(pac_id,socket) {
	if(pac_id in this.players){
		this.players[pac_id].socket = socket;
		return true;
	}
	return false;
};




playlist.prototype.getp1Name = function() {
	if(this.player1 == ""){
		return "Player";
	}
	return this.players[this.player1].name;
};

playlist.prototype.getp2Name = function() {
	if(this.player2 == ""){
		return "Player";
	}
	return this.players[this.player2].name;
};

playlist.prototype.getPqueueNames = function() {
	var temp = [];
	for (var i = this.pqueue.length - 1; i >= 0; i--) {
		temp.push(this.players[this.pqueue[i]].name);
	}
	return temp;
};

playlist.prototype.getGqueueNames = function() {
	var temp = [];
	for (var i = this.gqueue.length - 1; i >= 0; i--) {
		temp.push(this.players[this.gqueue[i]].name);
	}
	return temp;
};


//add a player (only internal user sice player() is not public)
playlist.prototype.addPlayer = function(player) {
	if(typeof player.pac_id === 'undefined'){
		return false;
		logger.log('debug', "addPlayer at playlist.js: pac_id is undefined");
	}else{
		this.players[player.pac_id] = player;
		if(this.player1 == ""){
			this.pqueue.push(player.pac_id);
			logger.log('debug', "addPlayer at playlist.js: pque player added ["+player.pac_id+"]");
		}else if(this.player2 == ""){
			this.gqueue.push(player.pac_id);
			logger.log('debug', "addPlayer at playlist.js: gque player added ["+player.pac_id+"]");
		}else if(this.pqueue.length <= this.gqueue.length ){
			this.pqueue.push(player.pac_id);
			logger.log('debug', "addPlayer at playlist.js: pque player added ["+player.pac_id+"]");
		}else{
			this.gqueue.push(player.pac_id);
			logger.log('debug', "addPlayer at playlist.js: gque player added ["+player.pac_id+"]");

		}
		this.updatecur();
		return true;
	}
};






//create a player from given parameter and add it to the player list
//todo: make name not required
playlist.prototype.createPlayer = function(pac_id, socket, name) {
	var tplayer = new player();
	tplayer.name = name;
	tplayer.pac_id = pac_id;
	tplayer.socket = socket;
	return this.addPlayer(tplayer);
};

//remove a player with a given pac_id from the que and from the player list
playlist.prototype.deletePlayerByPac_id = function(pac_id) {
	var qid = this.pqueue.indexOf(pac_id);
	if(qid !== -1){
		this.pqueue.splice(qid,1);
	}
	var gqid = this.gqueue.indexOf(pac_id);
	if(gqid !== -1){
		this.gqueue.splice(gqid,1);
	}
	delete this.players[pac_id];
	if(this.player1==pac_id)
		this.player1 = "";
	if(this.player2==pac_id)
		this.player2 = "";
	this.updatecur();
	logger.log('debug',"deletePlayerByPac_id at playlist.js: player deltete: " + pac_id);
};

playlist.prototype.updatecur = function() {
	if(this.player1 == ""){
		if(this.pqueue.length > 0){
			logger.log('debug',"updatecur at playerlist.js: set player1");
			this.player1 = this.pqueue.shift();
		}
	}
	if(this.player2 == ""){
		if(this.gqueue.length > 0){
			logger.log('debug',"updatecur at playerlist.js: set player2");
			this.player2 = this.gqueue.shift();
		}
	}
};

playlist.prototype.nextgame = function() {
	this.deletePlayerByPac_id(this.player1);
	this.deletePlayerByPac_id(this.player2);
	this.player1 = "";
	this.player2 = "";
	this.updatecur();
};

playlist.prototype.getPl1 = function(){
	return this.player1;
};

playlist.prototype.getPl2 = function(){
	return this.player2;
};

playlist.prototype.getpque = function() {
	return this.pqueue;
};

playlist.prototype.getgque = function() {
	return this.gqueue;
};

playlist.prototype.isPlayer1 = function(pac_id) {
	// logger.log('debug',"cheking for p1:" + pac_id+"=="+this.player1['pac_id']);
	return pac_id == this.player1;
};

playlist.prototype.isPlayer2 = function(pac_id) {
	return pac_id == this.player2;
};

playlist.prototype.isPlayer = function(pac_id) {
	return pac_id in this.players;
};

playlist.prototype.getPlayers = function() {
	return this.players;
};

playlist.prototype.getQuePos = function(pac_id) {
	if(this.player1 == pac_id||this.player2==pac_id){
		return 0;
	}

	var t = this.gqueue.indexOf(pac_id);
	if(t !== -1){
		return t+1;
	}
	t = this.pqueue.indexOf(pac_id);
	if(t !== -1){
		return t+1;
	}

};

playlist.prototype.updateName = function(pac_id,name) {
	if(pac_id in this.players){
		this.players[pac_id].name = name;
	}
};



module.exports = playlist;



