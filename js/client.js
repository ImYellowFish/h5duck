// Network client
var Client = {};
Client.socket = io.connect();

// --------------------------------------------
// functions
// --------------------------------------------

// ---------- login ---------------------------
// called when local player wants to join the game
Client.askNewPlayer = function(playerType){
	Client.socket.emit('newplayer', {playerType:playerType});
};


// ---------- player ---------------------------
// called when local player wants to send an input
Client.sendClick = function(x, y){
	Client.socket.emit('click', {x:x, y:y});
};

// called when local player wants to upload self position
Client.sendPosition = function(x, y){
	Client.socket.emit('uploadPos', {x:x, y:y});
};

Client.sendDealDamage = function(sourceID, targetID, damage){
	Client.socket.emit('dealDamage', {sourceID:sourceID, targetID:targetID, damage:damage});
}

Client.sendPlayerDie = function(playerID, killerID){
	Client.socket.emit('playerDie', {playerID:playerID, killerID:killerID});
}

Client.sendPlayerRespawn = function(playerID, x, y){
	Client.socket.emit('playerRespawn', {playerID:playerID, x:x, y:y});
}

// ---------- bullet ---------------------------
Client.sendCreateBullet = function(bulletID, playerID, x, y, type){
	Client.socket.emit('createBullet', {bulletID:bulletID, playerID:playerID, x:x, y:y, type:type});
}

Client.sendRemoveBullet = function(bulletID, playerID){
	Client.socket.emit('removeBullet', {bulletID:bulletID, playerID:playerID});
}

Client.sendBulletSync = function(bulletID, playerID, x, y){
	Client.socket.emit('bulletSync', {bulletID:bulletID, playerID:playerID, x:x, y:y});
}


// --------------------------------------------
// messages
// --------------------------------------------


// ---------- login/logout --------------------
Client.socket.on('newplayer', function(data){
	Game.addNewPlayer(data.id, data.x, data.y, false, data.playerType);
});

Client.socket.on('allplayers', function(data){
	console.log(data);
	var players = data.players;
	for(var i = 0; i < players.length; i++){
		var isLocalPlayer = data.newPlayerID == players[i].id;
		Game.addNewPlayer(players[i].id, players[i].x, players[i].y, isLocalPlayer, players[i].playerType);
	}
	Game.setNetworkReady();
});

Client.socket.on('remove', function(id){
	Game.removePlayer(id);
});


// ---------- player ---------------------------
Client.socket.on('move', function(data){
	Game.movePlayer(data.id, data.x, data.y);
});

Client.socket.on('syncPos', function(data){
	Game.syncPlayerPos(data.id, data.x, data.y);
});

Client.socket.on('recvDamage', function(data){
	Game.recvDamage(data.sourceID, data.targetID, data.damage);
});

Client.socket.on('playerDie', function(data){
	Game.recvPlayerDie(data.playerID, data.killerID);
});

Client.socket.on('playerRespawn', function(data){
	Game.recvPlayerRespawn(data.playerID, data.x, data.y);
});

// ---------- bullet ---------------------------
Client.socket.on('createBullet', function(data){
	Game.recvCreateBullet(data);
});

Client.socket.on('removeBullet', function(data){
	Game.recvRemoveBullet(data);
});

Client.socket.on('bulletSync', function(data){
	Game.recvBulletSync(data);
});
