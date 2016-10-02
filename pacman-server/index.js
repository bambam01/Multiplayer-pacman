var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var playlist = require('./client/playlist.js');
var game = require('./server/game.js');
app.use(cookieParser('29374982489928349'));

var http = require('http').Server(app);
var io = require('socket.io')(http);
var logger = require('./util/logger');


var currentsecret = "1234";
var cururl = "test"
var players = 0;
var maxplayers = 2;
var clients = [];
var curplayers = [];
var playerlist = new playlist();


app.set('view engine', 'ejs');
logger.log(logger.debugLevel,"logging at level: " + logger.debugLevel);

//generate a 5 chracter random string
function gensecret(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

//todo: reset the game
function restart(){
  currentsecret = gensecret();
}

//set socket.io domains
var screenn = io.of('/screen');
var control = io.of('/control');
var screensocket = "";
//todo: on screen connection
screenn.on('connection', function(socket){
  if(screensocket == ""){
    screensocket = socket;
  }else{
    socket.disconnect('unauthorized');
  }
  socket.on('screen',function(msg){
    logger.log('debug', msg['status']);
    updatescreen();
  });

  socket.on('newgame',function(msg){
    logger.log('debug', 'new game');
    //next game
    playerlist.players[playerlist.getPl1()].socket.emit("end");
    playerlist.players[playerlist.getPl2()].socket.emit("end");
    playerlist.nextgame();

  });

  socket.on('disconnect', function(msg) {
    //delete the screen
    logger.log('debug',"Screen conection lost");
    screensocket = "";
  });
});

//on controler connection
control.on('connection', function(socket){
  logger.log('debug',"on connect at index.js: client connection: [" + socket.handshake.headers.cookie + "]");
  //on handshake
  socket.on('handshake',function(msg){
    //add player to playerlist
    var pac_id = msg["pac_id"];
    if(playerlist.isPlayer(pac_id)){
      playerlist.setPlayerSocket(pac_id,socket);
      playerlist.reconnect(pac_id);
    }else{
      playerlist.createPlayer(pac_id, socket, "Player");
      
    }
    updatescreen();
   
    // if(!(pac_id in clients)){
    //   clients[pac_id] = socket;
    //   console.log("added socket to list ");
    // }else{
    //   console.log("socket is already in list");
    // }
    // 
    

    
  });

  socket.on('control', function(msg){
    // logger.log('debug', "control player:" + msg["pac_id"] + " action:" + msg["dir"])
    //screensocket.emit('control','s');

    if(playerlist.isPlayer1(msg['pac_id'])){
      screensocket.emit('pcontrol',msg['dir']);
      // logger.log('debug', "sending p1 command");
    }else if(playerlist.isPlayer2(msg['pac_id'])){
      screensocket.emit('gcontrol',msg['dir'])
    }
    // var p = playlist.getPlayerByPac_id(msg[pac_id]);
    // screensocket.emit('control',msg['dir']);
  });

  socket.on('name', function (msg) {
    playerlist.updateName(msg['pac_id'],msg['name']);
    updatescreen();
  })



  //on disconnect
  socket.on('disconnect', function(msg) {
 
    //remove player from playerlist (temp)
    var pac_id = getCookie(socket.handshake.headers.cookie, "pac_id");

    playerlist.disconnect(pac_id);
    setTimeout(function () {
      logger.log('debug',"chcking delete stuff");
      if(playerlist.isDisconnected(pac_id)){
        playerlist.deletePlayerByPac_id(pac_id);
      }
    },5000);
    
  
    logger.log('debug',"on disconect at index.js: client disconected [" +socket.handshake.headers.cookie + "]");
    updatescreen();
  });
});


//on anny connection (not used)
io.on('connection', function(socket){
  //console.log('a user connected');
  
});

//start normal websever for serving pages
http.listen(8080, function(){
  console.log('listening on *:8080');
});

//not used
io.on('connection', function(socket){
  socket.on('screen', function(msg){

  });
});

app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); 
  next(); 
});

//on http request for /connect
app.get('/connect',function(req, res) {

    logger.log('debug',"on connect at index.js: Global http connect ")

    //todo: add code to allow reconecting
    if(playerlist.isPlayer(req.cookies['pac_id'])){//queue.indexOf(req.cookies['pac_id']) !== -1){
        playerlist.reconnect(req.cookies['pac_id']);
        logger.log('debug',"on coonect at index.js: client reconnected after disconect " + req.cookies['pac_id']);
      //var pos = queue.indexOf(req.cookies['pac_id']);
      var name = 0;
      if(playerlist.isPlayer1(req.cookies['pac_id']) && playerlist.getp1Name() != "Player"){
        name = 1;
        logger.log('debug',"on connect at index.js: name is known as player1");
      }else if(playerlist.isPlayer2(req.cookies['pac_id']) && playerlist.getp2Name() != "Player"){
        name = 1;
        logger.log('debug',"on connect at index.js: name is known as player2")
      }

      res.render('client', { code: req.cookies['pac_id'], place:0, name: name });
    }else{
      var cod = gensecret();
      //queue.push(cod);
      //var pos = queue.indexOf(cod);
      logger.log('debug',"on connect at index.js: First http request");

      res.render('client', { code: cod, place:0, name: 0});
    }
    updatescreen();
    
    
});

//server static pagess
app.use('/', express.static(__dirname + '/static'));

//tools

//trunicate a string at lenth n
String.prototype.trunc = String.prototype.trunc ||
      function(n){
          return (this.length > n) ? this.substr(0,n-1)+'&hellip;' : this;
      };


//create a simple commandline interafe for debuging puposes
var readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('OHAI> ');
rl.prompt();

rl.on('line', function(line) {
  switch(line.trim()) {
    case 'pque':
      console.log(playerlist.pqueue);
      break;
    case 'gque':
      console.log(playerlist.gqueue);
      break;
    case 'pclient':
     log_a(playerlist.players);
      break;
    case 'pclientf':
     console.log(playerlist.players);
      break;
    case 'player1':
     console.log(playerlist.player1);
      break;
    case 'player2':
     console.log(playerlist.player2);
      break;
    case 'all':
     console.log(playerlist);
     break;
    case 'screen':
      console.log(screensocket);
      break;
    case 'update':
      updatescreen();
      break;
    default:
      console.log('pque,pclient,pclientf,player1,player2,all');
      break;
  }
  rl.prompt();
}).on('close', function() {
  console.log('Have a great day!');
  process.exit(0);
});


// log an array sor of
function log_a(myArray){
  for (var i in myArray) {
    console.log(i);
    };
}

//retun a cookie from a given socket cookie string
function getCookie(cookies, cname) {
      //todo: error if not cookie
      var name = cname + "=";
      var ca = cookies.split(';');
      for(var i=0; i<ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1);
          if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
      }
      return "";
  }


function updatescreen() {
  if(screensocket != ""){
    screensocket.emit('info',{'pname':playerlist.getp1Name(),'gname':playerlist.getp2Name(),'pqueue':playerlist.getPqueueNames(),'gqueue':playerlist.getGqueueNames()});
  }
  var tplayers = playerlist.players;
  for (var key in tplayers) {
      tplayers[key].socket.emit('queue',playerlist.getQuePos(tplayers[key].pac_id));
      logger.log('debug','sending player data to' + tplayers[key].pac_id);
  }
}




