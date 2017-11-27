// Main game state
// --------------------------------------------
// Lifecycles
// --------------------------------------------
var Game = {};

Game.width = config.gameWidth * config.gameWindowScale;
Game.height = config.gameHeight * config.gameWindowScale;

Game.init = function(){
	game.stage.disableVisibilityChange = true;
}

Game.preload = function(){
	game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.spritesheet('tileset', 'assets/map/tilesheet.png', 32, 32);
	game.load.image('default_player', 'assets/sprites/sprite.png');
	game.load.image('bullet', 'assets/sprites/diamond.png');
	game.load.spritesheet('baddie', 'assets/sprites/baddie.png', 32, 32);

	UI.preload();
}

Game.create = function(){
	console.log("Game Start.");

	// enable physics
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	// setup map
	var map = game.add.tilemap('map');
	map.addTilesetImage('tilesheet', 'tileset');
	var layer;
	for(var i = 0; i < map.layers.length; i++){
		layer = map.createLayer(i);
	}
	layer.inputEnabled = true;
	// layer.events.onInputUp.add(Game.getCoordinates, this);

	// init player container
	Game.playerMap = {};
	Game.nonLocalPlayerGroup = game.add.group();
	Game.nonLocalPlayerGroup.enableBody = true;

	// init network
	var playerType = Game.randomPlayerType().key;
	Client.askNewPlayer(playerType);
	networking.create();
}

Game.update = function(){
	if(!networking.ready)
		return;

	// player updates
	Object.keys(Game.playerMap).forEach(function(key) {
    	if(Game.playerMap[key] != null)
    		Game.playerMap[key].update();
	});

	// network updates
	networking.update();

}


// --------------------------------------------
// input callbacks
// --------------------------------------------

Game.getCoordinates = function(layer, pointer){
	if(!networking.ready)
		return;

	// Client.sendClick(pointer.worldX, pointer.worldY);
	Game.movePlayer(pointer.worldX, pointer.worldY);
}


Game.movePlayer = function(x, y){
	if(!networking.ready)
		return;

	Game.localPlayer.moveStep(x, y);
}

// --------------------------------------------
// network callbacks
// --------------------------------------------

// ---------- general -------------------------
Game.setNetworkReady = function(){
	console.log('local player id: ' + Game.localPlayerID + ', localPlayer: ' + Game.localPlayer);
	console.log(Game.playerMap);

	// set the network as ready
	networking.ready = true;

	// init UI here so UI has the highest draw order.
	UI.create();
}


// ---------- players -------------------------

// called when server commands adding new player
Game.addNewPlayer = function(id,x,y,isLocalPlayer,playerType){
	var newPlayer = Player.createNew(id, x, y, isLocalPlayer, playerType);
	Game.playerMap[id] = newPlayer;
	newPlayer.registerNetUpdate();

	if(isLocalPlayer){
		// record local player info
		Game.localPlayer = newPlayer;
		Game.localPlayerID = id;			
	} 

	return newPlayer;
};

// called when server commands removing player
Game.removePlayer = function(id){
	if(!networking.ready)
		return;

	Game.playerMap[id].onRemove();
	delete Game.playerMap[id];
};

// called when local player wants to upload current position
Game.sendPlayerPos = function(x, y){
	Client.sendPosition(x, y);
}

// called when server informs a player's position
Game.syncPlayerPos = function(id, x, y){
	if(!networking.ready)
		return;

	var player = Game.playerMap[id];
	player.onSyncPosition(x, y);
}


Game.sendDealDamage = function(sourceID, targetID, damage){
	Client.sendDealDamage(sourceID, targetID, damage);
}

Game.recvDamage = function(sourceID, targetID, damage){
	if(targetID == Game.localPlayerID){
		Game.localPlayer.takeDamage(sourceID, targetID, damage);
	}
}

Game.sendPlayerDie = function(playerID, killerID){
	Client.sendPlayerDie(playerID, killerID);
}

Game.recvPlayerDie = function(playerID, killerID){
	if(!networking.ready)
		return;
	var player = Game.playerMap[playerID];
	if(!player)
		return;

	player.die();

	if(playerID == Game.localPlayerID){
		// this line will not be executed
	}else if(killerID == Game.localPlayerID){
		console.log('you have killed Player ' + playerID);
	}else{
		// do other things
	}

}

Game.sendPlayerRespawn = function(playerID, x, y){
	Client.sendPlayerRespawn(playerID, x, y);
}

Game.recvPlayerRespawn = function(playerID, x, y){
	if(!networking.ready)
		return;
	if(playerID != Game.localPlayerID){
		Game.playerMap[playerID].respawn(x, y);
	}
}

// ---------- bullets -------------------------

// called when local player wants to spawn a bullet in server
Game.sendCreateBullet = function(bullet){
	Client.sendCreateBullet(bullet.id, bullet.playerID, bullet.x, bullet.y, 0);
}

// called when server informs that a new bullet is spawned
Game.recvCreateBullet = function(bulletData){
	if(!networking.ready)
		return;

	var player = Game.playerMap[bulletData.playerID];
	player.createBullet(bulletData.bulletID, bulletData.x, bulletData.y, 'bullet');
}

// called when local player wants to despawn a bullet in server
Game.sendRemoveBullet = function(bullet){
	Client.sendRemoveBullet(bullet.id, bullet.playerID);
}

// called when server informs that a bullet is despawned
Game.recvRemoveBullet = function(bulletData){
	if(!networking.ready)
		return;

	var player = Game.playerMap[bulletData.playerID];
	player.removeBullet(bulletData.bulletID);
}

Game.sendBulletSync = function(bullet){
	Client.sendBulletSync(bullet.id, bullet.playerID, bullet.x, bullet.y);
}

Game.recvBulletSync = function(bulletData){
	if(!networking.ready)
		return;

	var player = Game.playerMap[bulletData.playerID];
	if(player){
		var bullet = player.bullets[bulletData.bulletID];
		if(bullet){
			bullet.onSyncStatus(bulletData.x, bulletData.y);
		}else{
			player.createBullet(bulletData.bulletID, bulletData.x, bulletData.y, 'bullet');
		}
	}
}

// --------------------------------------------
// Utility
// --------------------------------------------
Game.randomInt = function(high, low){
	return Math.floor(Math.random() * (high - low) + low);
}

Game.randomItem = function(collection){
	var keys = Object.keys(collection)
    return collection[keys[ keys.length * Math.random() << 0]];
}

Game.randomPlayerType = function(){
	return Game.randomItem(config.playerType);
}

Game.randomBulletType = function(){
	return Game.randomItem(config.bulletType);
}