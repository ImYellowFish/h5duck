// --------------------------------------------
// setup
// --------------------------------------------

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var lobby = require('./serverlobby.js');

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/phaser-input', express.static(__dirname + '/node_modules/@orange-games/phaser-input/build/'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.lastPlayerID = 1;
server.listen(8081, function(){
	console.log('Listening on ' + server.address().port);
});

var g_logLevel = 2;
var g_playerIDSocketMap = {};
var g_scoreToRank = {"0": 1, leaderID: -1};
var g_startTime = Date.now();
var g_maxPlayers = 100;

// --------------------------------------------
// messages
// --------------------------------------------
io.on('connection', function(socket){

	// ------------- login/logout -----------------------------
	// login message
	socket.on('newplayer', function(data){
		var playerCount = Object.keys(io.sockets.connected).length;

		// limit the max number of players
		if(playerCount > g_maxPlayers){
			socket.emit('serverBusy');
			socket.disconnect(true);
			return;
		}

		// init player
		socket.player = {
			id: server.lastPlayerID++,
			playerType: data.playerType,
			playerName: data.playerName,
			x: randomInt(100, 1000),
			y: randomInt(100, 1000),
			state: "idle",
			kills: 0,
			deaths: 0,
		};
		g_playerIDSocketMap[socket.player.id] = socket;

		// join room
		var room = lobby.getQuickRoom();
		room.addSocket(socket.player.id, socket);
		logs(5, "player join room", room.key);

		// inform add new player event
		socket.emit('allplayers', getAllPlayers(socket.player.id, room));
		socket.broadcast.to(socket.room).emit('newplayer', socket.player);
		
		// logout
		socket.on('disconnect', function(){
			delete g_playerIDSocketMap[socket.player.id];
			io.to(socket.room).emit('remove', socket.player.id);
			room.removeSocket(socket.player.id, socket);
			logs(5, 'logout:', socket.player.id);
		});

		// ------------- player -----------------------------
		// called when recv click input from client
		socket.on('click', function(data){
			console.log('click to ' + data.x + ', ' + data.y);
			socket.player.x = data.x;
			socket.player.y = data.y;
			io.to(socket.room).emit('move', socket.player);
		});

		// called when received player position from client
		socket.on('uploadPos', function(data){
			socket.player.x = data.x;
			socket.player.y = data.y;
			socket.broadcast.to(socket.room).emit('syncPos', data);
		});

		socket.on('playerState', function(data){
			socket.player.state = data.state;
			logs(1, data.id, data.state);
			socket.broadcast.to(socket.room).emit('playerState', data);
		});

		// called when some player deals damage to another
		socket.on('dealDamage', function(data){
			// var targetSocket = findSocket(data.targetID);
			// if(targetSocket){
			// 	targetSocket.emit('recvDamage', data);
			// 	logs(2, 'send damage:', 'from', data.sourceID, 'to', data.targetID, 'damage', data.damage);				
			// }
			socket.broadcast.to(socket.room).emit('recvDamage', data);
			logs(2, 'send damage:', 'from', data.sourceID, 'to', data.targetID, 'damage', data.damage);	
		});

		socket.on('playerDie', function(data){
			socket.broadcast.to(socket.room).emit('playerDie', data);
			
			var victim = socket.player;
			var killerSocket = findSocket(data.killerID);
			var killer = killerSocket ? killerSocket.player : null;

			// update kd
			if(data.playerID != data.killerID && killer){
				killer.kills++;
				killerSocket.to(socket.room).emit('updateScore', killer);
			}
			if(victim){
				victim.deaths++;
				socket.to(socket.room).emit('updateScore', victim);
			}
			logs(3, 'player die', data.playerID, 'killer', data.killerID);

			// update ranks
			g_scoreToRank = getScoreToRank();
			io.to(socket.room).emit('updateRank', g_scoreToRank);
		});

		socket.on('playerRespawn', function(data){
			socket.broadcast.to(socket.room).emit('playerRespawn', data);
			logs(3, 'player respawn', data.playerID);

		});

		socket.on('changePlayerType', function(data){
			socket.player.playerType = data.playerType;
			socket.player.x = data.x;
			socket.player.y = data.y;
			socket.broadcast.to(socket.room).emit('changePlayerType', data);
		});

		// ------------- bullet -----------------------------
		// called when a client has spawned a bullet
		socket.on('createBullet', function(data){
			socket.broadcast.to(socket.room).emit('createBullet', data);
		});

		// called when a client has despawned a bullet
		socket.on('removeBullet', function(data){
			socket.broadcast.to(socket.room).emit('removeBullet', data);
		});

		// called when received player position from client
		socket.on('bulletSync', function(data){
			socket.broadcast.to(socket.room).emit('bulletSync', data);
		});

		logs(5, 'login:', 'id', socket.player.id, 'x', socket.player.x, 'y', socket.player.y, 'type', socket.player.playerType);		
	});


});



// --------------------------------------------
// helpers
// --------------------------------------------

// function checkHeartBeat(){
// 	var currentTime = Date.now();
// 	Object.keys(io.sockets.connected).forEach(function(socketID){
// 		var lastHeartBeat = io.sockets.connected[socketID].lastHeartBeat;
// 		if(currentTime - lastHeartBeat > heartBeatTimeOut){

// 		}
// 	})
// }

function getAllPlayers(newPlayerID, room){
	var data = {};
	var players = [];
	Object.keys(room.sockets).forEach(function(socketID){
		var player = room.sockets[socketID].player;
		if(player){
			players.push(player);
		}
	});

	data.players = players;
	data.newPlayerID = newPlayerID;
	data.scoreToRank = g_scoreToRank;
	data.startTime = room.startTime;
	return data;
}

function scoreCompareFunction(a, b){
	return b - a;
};

// bucket sort the ranks
function getScoreToRank(){
	var scoreBucket = {};

	Object.keys(io.sockets.connected).forEach(function(socketID){
		var player = io.sockets.connected[socketID].player;
		if(player){
			var score = player.kills;
			if(!scoreBucket[score]){
				scoreBucket[score] = 0;
			}
			scoreBucket[score]++;
		}
	});

	var scores = Object.keys(scoreBucket);
	scores.sort(scoreCompareFunction);

	var rank = 1;
	var scoreToRank = {};
	for(var i = 0; i < scores.length; i++){
		var s = scores[i];
		scoreToRank[s] = rank;
		rank += scoreBucket[s];
	}

	scoreToRank.leaderScore = scores[0];
	scoreToRank.leaderID = -1;
	if(scores[0]){
		Object.keys(io.sockets.connected).forEach(function(socketID){
			var player = io.sockets.connected[socketID].player;
			if(player && player.kills == scores[0])
				scoreToRank.leaderID = player.id;
		});
	}
	return scoreToRank;
};

function findSocket(playerID){
	return g_playerIDSocketMap[playerID];
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