// Main game state
// --------------------------------------------
// Lifecycles
// --------------------------------------------
var Game = {};

Game.localPlayerName = "unknown";
Game.localPlayerKills = 0;
Game.localPlayerDeaths = 0;
Game.rankToScore = null;

Game.startTime = 0;
Game.width = config.gameWidth * config.gameWindowScale;
Game.height = config.gameHeight * config.gameWindowScale;

Game.init = function(){
	game.stage.disableVisibilityChange = true;
}

Game.preload = function(){	
	// load characters
	characterLoader.preloadSpriteSheet("black", "black");
	characterLoader.preloadSpriteSheet("red", "red");
	characterLoader.preloadSpriteSheet("blue", "blue");
	characterLoader.preloadSpriteSheet("yellow", "yellow");

	// load bullets
	characterLoader.preloadSpriteSheet("bullet", "bullet");
	effect.preload();
	levelBuilder.preload();
	UI.preload();

	if(config.debugFPS)
		game.time.advancedTiming = true;

}

Game.create = function(){
	console.log("Game Start.");
	
	game.world.setBounds(0, 0, config.gameWorldWidth, config.gameWorldHeight);
	
	// enable physics
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	// setup map
	Game.level = levelBuilder.createLevel();
	
	// init player container
	Game.playerMap = {};
	if(!Game.nonLocalPlayerGroup){
		Game.nonLocalPlayerGroup = game.add.group();
		Game.nonLocalPlayerGroup.enableBody = true;
	}

	// init network
	var playerType = Game.randomPlayerType().key;
	if(config.debugPlayerType){
		playerType = config.debugPlayerType;
	}

	// init network and require login
	Client.init();
	Client.askNewPlayer(playerType, Game.localPlayerName);
	networking.create();

	// characterLoader.testAnimation();
	// effect.test();
	// Game.testZap();
	// Game.testDie();
}

Game.update = function(){
	if(!Game.ready)
		return;

	// player updates
	Object.keys(Game.playerMap).forEach(function(key) {
    	if(Game.playerMap[key] != null)
    		Game.playerMap[key].update();
	});

	// network updates
	networking.update();
	UI.update();
}

// debug
if(config.debug){
	Game.render = function(){	
		Game.debugOnRender();
	}
}


// --------------------------------------------
// input callbacks
// --------------------------------------------

Game.getCoordinates = function(layer, pointer){
	if(!Game.ready)
		return;

	// Client.sendClick(pointer.worldX, pointer.worldY);
	Game.movePlayer(pointer.worldX, pointer.worldY);
}


Game.movePlayer = function(x, y){
	if(!Game.ready)
		return;

	Game.localPlayer.moveStep(x, y);
}

// --------------------------------------------
// network callbacks
// --------------------------------------------

// ---------- general -------------------------
Game.setReady = function(){
	console.log('local player id: ' + Game.localPlayerID + ', localPlayer: ' + Game.localPlayer);
	console.log(Game.playerMap);

	// set the network as ready
	Game.ready = true;

	// init UI here so UI has the highest draw order.
	UI.create();
}


// ---------- players -------------------------

// called when server commands adding new player
Game.addNewPlayer = function(id,x,y,isLocalPlayer,playerType, playerName){
	var newPlayer = Player.createNew(id, x, y, isLocalPlayer, playerType, playerName);
	Game.playerMap[id] = newPlayer;
	newPlayer.registerNetUpdate();

	if(isLocalPlayer){
		Game.registerLocalPlayer(newPlayer);
	} 

	return newPlayer;
};

Game.registerLocalPlayer = function(player){
	Game.localPlayer = player;
	Game.localPlayerID = player.id;
	game.camera.follow(player.sprite, 
			Phaser.Camera.FOLLOW_PLATFORMER, 
			config.cameraFollowLerpX, 
			config.cameraFollowLerpY);
}


Game.changePlayerType = function(id, x, y, isLocalPlayer, playerType, playerName){
	// hack
	if(isLocalPlayer){
		x = Game.localPlayer.x;
		y = Game.localPlayer.y;
	}

	console.log("change type", id, x, y, isLocalPlayer, playerType, playerName);
	var player = Game.playerMap[id];
	var life = player.life;
	var dir = player.direction;
	player.setPlayerType(playerType);
	player.life = life * 0.7;
	player.x = x;
	player.y = y;
	player.direction = dir;

	if(isLocalPlayer){
		Game.registerLocalPlayer(player);
		Client.sendChangePlayerType(id, x, y, playerType, playerName);	
	}
}

// called when server commands removing player
Game.removePlayer = function(id){
	if(!Game.ready)
		return;

	Game.playerMap[id].onRemove();
	delete Game.playerMap[id];
};

// called when local player wants to upload current position
Game.sendPlayerPos = function(x, y, direction, life){
	Client.sendPosition(Game.localPlayerID, x, y, direction, life);
}

// called when server informs a player's position
Game.syncPlayerPos = function(id, x, y, direction, life){
	if(!Game.ready)
		return;

	var player = Game.playerMap[id];
	player.onSyncPosition(x, y, direction, life);
}


Game.sendPlayerState = function(state){
	Client.sendPlayerState(Game.localPlayerID, state);
};

Game.recvPlayerState = function(id, state){
	if(!Game.ready)
		return;
	var player = Game.playerMap[id];
	if(player)
		player.playerfsm.goto(state, true);
};


Game.sendDealDamage = function(sourceID, targetID, damage, onHitType, onHitPosX, onHitPosY){
	Client.sendDealDamage(sourceID, targetID, damage, onHitType, onHitPosX, onHitPosY);
	// react to the damage message on sender immediately.
	Game.recvDamage(sourceID, targetID, damage, onHitType, onHitPosX, onHitPosY);
}

Game.recvDamage = function(sourceID, targetID, damage, onHitType, onHitPosX, onHitPosY){
	if(Game.ready){
		Game.playerMap[targetID].takeDamage(sourceID, targetID, damage, onHitType, onHitPosX, onHitPosY);
	}
}

Game.sendPlayerDie = function(playerID, killerID){
	Client.sendPlayerDie(playerID, killerID);

	// inform UI
	UI.onPlayerDie(playerID, killerID);
}

Game.recvPlayerDie = function(playerID, killerID){
	if(!Game.ready)
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

	// inform UI
	UI.onPlayerDie(playerID, killerID);
}

Game.sendPlayerRespawn = function(playerID, x, y){
	Client.sendPlayerRespawn(playerID, x, y);
}

Game.recvPlayerRespawn = function(playerID, x, y){
	if(!Game.ready)
		return;
	if(playerID != Game.localPlayerID){
		Game.playerMap[playerID].respawn(x, y);
	}
}

// ---------- bullets -------------------------

// called when local player wants to spawn a bullet in server
Game.sendCreateBullet = function(bullet){
	Client.sendCreateBullet(bullet.id, bullet.playerID, bullet.x, bullet.y, bullet.direction, bullet.type);
}

// called when server informs that a new bullet is spawned
Game.recvCreateBullet = function(bulletData){
	if(!Game.ready)
		return;

	var player = Game.playerMap[bulletData.playerID];
	player.createBullet(bulletData.bulletID, bulletData.x, bulletData.y, bulletData.direction, bulletData.bulletType);
}

// called when local player wants to despawn a bullet in server
Game.sendRemoveBullet = function(bullet){
	Client.sendRemoveBullet(bullet.id, bullet.playerID);
}

// called when server informs that a bullet is despawned
Game.recvRemoveBullet = function(bulletData){
	if(!Game.ready)
		return;

	var player = Game.playerMap[bulletData.playerID];
	player.removeBullet(bulletData.bulletID);
}

Game.sendBulletSync = function(bullet){
	Client.sendBulletSync(bullet.id, bullet.playerID, bullet.x, bullet.y, bullet.direction, bullet.type);
}

Game.recvBulletSync = function(bulletData){
	if(!Game.ready)
		return;

	var player = Game.playerMap[bulletData.playerID];
	if(player){
		var bullet = player.bullets[bulletData.bulletID];
		if(bullet){
			bullet.onSyncStatus(bulletData.x, bulletData.y);
		}else{
			player.createBullet(bulletData.bulletID, bulletData.x, bulletData.y, bulletData.direction, bulletData.bulletType);
		}
	}
}


// ---------- Scores ---------------------------
Game.recvUpdateScore = function(data){
	console.log("new Score: ", data.kills, data.deaths);
	Game.localPlayerKills = data.kills;
	Game.localPlayerDeaths = data.deaths;

	UI.onGameScoreChanged();
}

Game.recvUpdateRank = function(data){
	console.log("rank:", data);
	var leader = Game.playerMap[data.leaderID];
	var leaderName = "??????";
	var leaderScore = "?";
	if(leader && data.leaderScore > 0){
		leaderName = leader.name;
		leaderScore = data.leaderScore;
	}

	var selfRank = data[Game.localPlayerKills];
	if(!selfRank){
		selfRank = "?";
	}

	UI.onGameRankChanged(
		selfRank,
		Game.localPlayerName,
		Game.localPlayerKills,
		leaderName,
		leaderScore);
}


// --------------------------------------------
// Utility
// --------------------------------------------
Game.randomInt = function(high, low){
	return Math.floor(Math.random() * (high - low) + low);
}

Game.randomItem = function(collection){
	var keys = Object.keys(collection);
    return collection[keys[ keys.length * Math.random() << 0]];
}

Game.nextItem = function(collection, current){
	var keys = Object.keys(collection);
	var index = keys.indexOf(current);
	var resultIndex = index >= 0 ? (index + 1) % keys.length : 0;
	console.log("nextType", collection[keys[resultIndex]])
	return keys[resultIndex];
}

Game.randomPlayerType = function(){
	return Game.randomItem(config.playerType);
}

Game.nextPlayerType = function(type){
	return Game.nextItem(config.playerType, type);
}

Game.randomBulletType = function(){
	return Game.randomItem(config.bulletType);
}

// rough culling for sprites, but good enough for demo
Game.isPosInView = function(x, y){
	return game.camera.view.contains(x, y);
}

Game.randomSign = function(){
	if(Math.random() >= 0.5)
		return 1;
	return -1;
}

Game.addNonLocalPlayer = function(player){
	Game.nonLocalPlayerGroup.add(player.sprite);
}

// --------------------------------------------
// Debug
// --------------------------------------------
Game.debugOnRender = function() {
	Game.debugTextY = 4;
	
	if(config.debugPlayerBody && Game.playerMap){
		Object.keys(Game.playerMap).forEach(function(key){
			game.debug.body(Game.playerMap[key].sprite);
			game.debug.pixel(Game.playerMap[key].gun_x - game.camera.x,
				Game.playerMap[key].gun_y - game.camera.y, 'rgba(0,0,255,1)', 4);
			game.debug.pixel(Game.playerMap[key].x - game.camera.x,
				Game.playerMap[key].y - game.camera.y, 'rgba(255,0,0,1)', 4);
			game.debug.spriteBounds(Game.playerMap[key].sprite, 'rgba(255,0,0,1)', false)
		});
	}

	if(config.debugPlayerState && Game.localPlayer){
		Game.debugTextY += 10;
		game.debug.text(Game.localPlayer.playerfsm.state, 2, Game.debugTextY,  "#00ff00");
	}

	if(config.debugFPS){
		Game.debugTextY += 10;
		game.debug.text(game.time.fps || '--', 2, Game.debugTextY, "#00ff00");
	}

	if(config.debugLevelBlockBody){
		Game.level.blockGroup.forEachAlive(function(member){game.debug.body(member);}, this);
	}

	if(config.debugLevelZapBody){
		Game.level.zapGroup.forEachAlive(function(member){game.debug.body(member);}, this);
		Game.level.jellyGroup.forEachAlive(function(member){game.debug.body(member);}, this);
		Game.level.waterGroup.forEachAlive(function(member){game.debug.body(member);}, this);
	}

	if(config.debugBulletBody){
		Object.keys(Game.playerMap).forEach(function(key){
			var player = Game.playerMap[key];
			Object.keys(player.bullets).forEach(function(bk){
				var bullet = player.bullets[bk];
				game.debug.body(bullet.sprite);
				game.debug.pixel(bullet.x - game.camera.x, bullet.y - game.camera.y, 'rgba(255,0,0,1)', 4);
				game.debug.spriteBounds(bullet.sprite, 'rgba(255,0,0,1)', false)
			});
		});
	}

	if(config.debugEffectPool){
		if(effect && effect.pools){
			Object.keys(effect.pools).forEach(function(key, index){
				Game.debugTextY += 10;
				game.debug.text("pool: " + key + ", total: " + effect.pools[key].length, 2, Game.debugTextY, "#00ff00");
			});
		}
	}

	if(config.debugProfile){
		var keys = Object.keys(Game.playerMap);
		var renderedPlayers = 0;
		for(var i = 0; i < keys.length; i++){
			if(Game.playerMap[keys[i]].sprite.visible){
				renderedPlayers++;
			}
		}

		Game.debugTextY += 10;
		game.debug.text("players: " + keys.length + ", rendered: " + renderedPlayers, 2, Game.debugTextY, "#00ff00");
		
		var totalBullets = 0;
		keys.forEach(function(key){
			var bullets = Game.playerMap[key].bullets;
			totalBullets += Object.keys(bullets).length;
		});
		Game.debugTextY += 10;
		game.debug.text("bullets: " + totalBullets, 2, Game.debugTextY, "#00ff00");
	}

	if(config.debugBulletPool){
		if(characterLoader && characterLoader.bulletPool){
			Object.keys(characterLoader.bulletPool).forEach(function(key, index){
				Game.debugTextY += 10;
				game.debug.text("pool: " + key + ", total: " + characterLoader.bulletPool[key].length, 2, Game.debugTextY, "#00ff00");
			});
		}
	}
}

Game.testZap = function(){
	game.input.onDown.add(function(){
		if(Game.localPlayer)
			Game.localPlayer.zap();
	});
}

Game.testDie = function(){
	game.input.onDown.add(function(){
		if(Game.localPlayer){
			Game.localPlayer.takeDamage(Game.localPlayerID, Game.localPlayerID, 
				999999, "shotgunhit", Game.localPlayer.x, Game.localPlayer.y);
		}
	});
}
