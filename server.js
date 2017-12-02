// --------------------------------------------
// setup
// --------------------------------------------

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/phaser-input', express.static(__dirname + '/node_modules/@orange-games/phaser-input/build/'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.lastPlayerID = 0;
server.listen(8081, function(){
	console.log('Listening on ' + server.address().port);
});

var g_logLevel = 2;
// --------------------------------------------
// messages
// --------------------------------------------
io.on('connection', function(socket){

	// ------------- login/logout -----------------------------
	// login message
	socket.on('newplayer', function(data){
		// init player
		socket.player = {
			id: server.lastPlayerID++,
			playerType: data.playerType,
			x: randomInt(100, 400),
			y: randomInt(100, 400),
			state: "idle",
		};
		playerIDSocketMap[socket.player.id] = socket;
		
		socket.emit('allplayers', getAllPlayers(socket.player.id));
		socket.broadcast.emit('newplayer', socket.player);
		
		// logout
		socket.on('disconnect', function(){
			delete playerIDSocketMap[socket.player.id];
			io.emit('remove', socket.player.id);
			logs(5, 'logout:', socket.player.id);
		});

		// ------------- player -----------------------------
		// called when recv click input from client
		socket.on('click', function(data){
			console.log('click to ' + data.x + ', ' + data.y);
			socket.player.x = data.x;
			socket.player.y = data.y;
			io.emit('move', socket.player);
		});

		// called when received player position from client
		socket.on('uploadPos', function(data){
			socket.player.x = data.x;
			socket.player.y = data.y;
			socket.broadcast.emit('syncPos', data);
		});

		socket.on('playerState', function(data){
			socket.player.state = data.state;
			logs(2, data.id, data.state);
			socket.broadcast.emit('playerState', data);
		});

		// called when some player deals damage to another
		socket.on('dealDamage', function(data){
			// var targetSocket = findSocket(data.targetID);
			// if(targetSocket){
			// 	targetSocket.emit('recvDamage', data);
			// 	logs(2, 'send damage:', 'from', data.sourceID, 'to', data.targetID, 'damage', data.damage);				
			// }
			socket.broadcast.emit('recvDamage', data);
			logs(2, 'send damage:', 'from', data.sourceID, 'to', data.targetID, 'damage', data.damage);	
		});

		socket.on('playerDie', function(data){
			socket.broadcast.emit('playerDie', data);
			logs(3, 'player die', data.playerID, 'killer', data.killerID)
			
		});

		socket.on('playerRespawn', function(data){
			socket.broadcast.emit('playerRespawn', data);
			logs(3, 'player respawn', data.playerID);

		});

		// ------------- bullet -----------------------------
		// called when a client has spawned a bullet
		socket.on('createBullet', function(data){
			socket.broadcast.emit('createBullet', data);
		});

		// called when a client has despawned a bullet
		socket.on('removeBullet', function(data){
			socket.broadcast.emit('removeBullet', data);
		});

		// called when received player position from client
		socket.on('bulletSync', function(data){
			socket.broadcast.emit('bulletSync', data);
		});

		logs(5, 'login:', 'id', socket.player.id, 'x', socket.player.x, 'y', socket.player.y, 'type', socket.player.playerType);		
	});


});



// --------------------------------------------
// helpers
// --------------------------------------------

function getAllPlayers(newPlayerID){
	var data = {};
	var players = [];
	Object.keys(io.sockets.connected).forEach(function(socketID){
		var player = io.sockets.connected[socketID].player;
		if(player){
			players.push(player);
		}
	});

	data.players = players;
	data.newPlayerID = newPlayerID; 
	return data;
}

var playerIDSocketMap = {};
function findSocket(playerID){
	return playerIDSocketMap[playerID];
}

function randomInt(high, low){
	return Math.floor(Math.random() * (high - low) + low);
}

function getTimeStamp(){
	return Date.now();
}

function applyTimeStamp(data){
	data.time = getTimeStamp();
}


function log(logLevel, log){
	if(g_logLevel > logLevel){
		return;
	}
	console.log(log);
}

function logs(logLevel){
	if(g_logLevel > logLevel){
		return;
	}

	var s = '';
	for(var i = 1; i < arguments.length; i++){
		var a = arguments[i];
		if(!a)
			s += 'null';
		else
			s += a.toString();
		if(i < arguments.length - 1){
			s += '  ';
		}
	}

	console.log(s);
}