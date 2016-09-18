var player = require('./player.js');

function playlist () {
	this.players = undefined;
	this.que = undefined;

}

playlist.prototype.getPlayerByPac_id = function(pac_id) {
	if(pac_id in this.players){
		return this.players[pac_id];
	}else{
		return false;
	}
};

playlist.prototype.addPlayer = function(player) {
	if(typeof player.pac_id === 'undefined'){
		return false;
		logger.log('debug', "addPlayer at client.js: pac_id is undefined");
	}else{
		this.players[player.pac_id] = player;
		this.que.push(player.pac_id);
		logger.log('debug', "addPlayer at client.js: player added");
		return true;
	}
};

playlist.prototype.createPlayer = function(pac_id, socket, name) {
	var player = new player();
	player.name = name;
	player.pac_id = pac_id;
	player.socket = socket;
	return this.addPlayer(player);
};

playlist.prototype.deletePlayerByPac_id = function(pac_id) {
	var id = this.players.indexOf(pac_id);
	var qid = this.que.indexOf(pac_id);
	if(id !== -1){
		this.players.splice(id,1);
	}

	if(qid !== -1){
		this.que.splice(qid,1);
	}
};



module.exports = playlist;



