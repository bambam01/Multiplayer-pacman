//main method
function game () {
	//stuff

}



game.prototype.moveplayer1 = function (direction) {
	//set the direction for player 1 for the next tick
	//make sure direction is valid, may change to: direction in list
	if(direction === 'u'||direction === 'r'||direction === 'd'||direction === 'l'){
		this.p1dir = direction;
	}
}

game.prototype.moveplayer2 = function (direction) {
	//set the direction for player 1 for the next tick
	//make sure direction is valid, may change to: direction in list
	if(direction === 'u'||direction === 'r'||direction === 'd'||direction === 'l'){
		this.p2dir = direction;
	}
}