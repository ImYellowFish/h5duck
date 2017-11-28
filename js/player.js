// --------------------------------------------
// Player class
// --------------------------------------------


var Player = {
// --------------------------------------------
// Constructor
// --------------------------------------------
	createNew : function(id, x, y, isLocalPlayer, type){

// --------------------------------------------
// Setup
// --------------------------------------------
		var player = {};
		player.id = id;
		player.isLocalPlayer = isLocalPlayer;
		
		// read player typeInfo
		var playerTypeInfo = config.playerType[type];
		if(!playerTypeInfo){
			type = "default";
			playerTypeInfo = config.playerType.default;
		}
		player.type = type;
		player.playerTypeInfo = playerTypeInfo;

		// --------------- initialize parameters ----------------------
		// alive flag
		player.isAlive = true;

		// facing direction
		player.initDirection = config.playerInitFacingDir;
		player.direction = config.playerInitFacingDir;

		// player data
		// life
		player.maxLife = playerTypeInfo.maxLife;
		player.life = player.maxLife;
		
		// battle
		player.attackDuration = (playerTypeInfo.attackFrame+1) * 1000 / 24;
		player.onhitDuration = (playerTypeInfo.onhitFrame+1) * 1000 / 24;

		// physics param
		player.moveForceX = playerTypeInfo.moveForceX;
		player.moveForceY = playerTypeInfo.moveForceY;
		player.maxVelocityX = playerTypeInfo.maxVelocityX;
		player.maxVelocityY = playerTypeInfo.maxVelocityY;

		// misc
		player.spriteName = playerTypeInfo.spriteName;
		player.spriteScale = config.playerSpriteScale;
		player.offsetX = playerTypeInfo.offsetX;
		player.offsetY = playerTypeInfo.offsetY;
		player.bulletType = playerTypeInfo.bulletType;
		
		// setup sprite
		console.log("spriteName: " + player.spriteName);
		var sprite = characterLoader.createCharacterSprite(x,y,player.spriteName);
		player.sprite = sprite;

		sprite.scale.set(player.spriteScale);
		sprite.anchor.set(playerTypeInfo.anchorX, playerTypeInfo.anchorY);

		// setup physics
		if(isLocalPlayer){			
			// enable physics for localPlayer
			game.physics.arcade.enableBody(sprite);
			sprite.body.bounce.x = playerTypeInfo.bounceX;
			sprite.body.bounce.y = playerTypeInfo.bounceY;
			sprite.body.gravity.y = playerTypeInfo.gravity;
			sprite.body.drag.setTo(playerTypeInfo.drag);
			sprite.body.collideWorldBounds = true;
			sprite.body.immovable = false;


		}else{
			// add to collision group
			Game.nonLocalPlayerGroup.add(sprite);

			// disable physics for nonLocalPlayer
			sprite.body.immovable = true;
		}

		// setup hitBox	
		if(playerTypeInfo.useCustomHitBox){
			sprite.body.setSize(playerTypeInfo.hitBoxWidth, playerTypeInfo.hitBoxHeight, 
				playerTypeInfo.hitBoxOfffsetX, playerTypeInfo.hitBoxOfffsetY);
		}


		// position synchronizer
		player.posSync = 
			networking.SpritePosSynchronizer.createNew(
				player.sprite);

		// player state
		player.playerfsm = PlayerFSM.createNew(player);
		player.playerfsm.init();

		// getters
		Object.defineProperty(player, "x", {
			get: function() { return this.sprite.x; },
			set: function(x) { this.sprite.x = x; }
		});
		Object.defineProperty(player, "y", {
			get: function() { return this.sprite.y; },
			set: function(y){ this.sprite.y = y;}
		});
		Object.defineProperty(player, "body", {get: function() { return this.sprite.body; }});


// --------------------------------------------
// Operations
// --------------------------------------------
		// make the player sprite face the right direction
		player.face = function(){			
			player.sprite.scale.x = player.spriteScale * player.direction * player.initDirection;
		}

		// move for one step. Corresponds to one touch input.
		player.moveStep = function(px, py){
			if(!player.isAlive)
				return;

			var xdir = game.math.sign(px - player.x);
			var v = player.sprite.body.velocity;				
			v.x = game.math.clamp(v.x + player.moveForceX * xdir, -player.maxVelocityX, player.maxVelocityX);
			v.y = game.math.clamp(v.y + player.moveForceY, -player.maxVelocityY, player.maxVelocityY);

			player.sprite.body.velocity = v;
			
			// update player direction
			if(xdir != 0){
				player.direction = xdir;
				player.face();
			}

			player.playerfsm.onStepMove();
		};

		// fire a bullet based on player status
		// can only fire on local player
		player.fire = function(power){
			if(!player.isAlive)
				return;

			if(player.isLocalPlayer){
				player.createBullet(null, player.x, player.y, player.direction, player.bulletType);
				player.playerfsm.onFire();
			}
		};

		// deal damage to another player
		player.dealDamage = function(targetID, damage){
			if(!player.isAlive)
				return;

			if(player.isLocalPlayer){
				Game.sendDealDamage(player.id, targetID, damage);
			}
		};

		// reduce hp and check for death.
		// called when server tells to take damage, or when local player gets hit by traps
		player.takeDamage = function(sourceID, targetID, damage){
			if(!player.isAlive)
				return;

			console.log('take damage: ' + damage);
			player.life -= damage;
			if(player.life <= 0){
				player.die(sourceID);
			}

			if(player.isLocalPlayer){
				player.events.lifeChange.dispatch(player.life);
				player.playerfsm.onGetHit();
			}
		};

		player.die = function(killerID){
			if(!player.isAlive)
				return;

			player.life = 0;
			player.isAlive = false;
			console.log("player is dead: " + player.id);

			if(player.isLocalPlayer){
				// if local, informs server
				Game.sendPlayerDie(player.id, killerID);
				
				// display killer info
				console.log("you are killed by Player " + killerID);

				// delay respawn
				game.time.events.add(config.playerRespawnDelay, player.onRespawnTimerRing, this);
			}
		};

		
		player.respawn = function(x, y){
			console.log('player respawned.');
			player.isAlive = true;
			player.life = player.maxLife;
			player.x = x;
			player.y = y;

			if(player.isLocalPlayer){
				Game.sendPlayerRespawn(player.id, x, y);
				player.events.lifeChange.dispatch(player.life);
				player.playerfsm.onRespawn();
			}else{
				player.posSync.reset(x, y);
			}

		};

		// register network update
		player.registerNetUpdate = function(){
			networking.registerUpdate(player.netUpdate);
		};

		
// --------------------------------------------
// Bullet management
// --------------------------------------------
		// bullets
		player.bullets = {};

		// create a bullet with custom parameters.
		// if local player, informs the server to broadcast
		// pass null as bulletID for local players.
		player.createBullet = function(bulletID, x, y, direction, type){
			if(!type)
				type = player.bulletType;

			var bullet = Bullet.createNew(player.id, bulletID, x, y, player.direction, type);
			bullet.registerNetUpdate();
			
			player.bullets[bullet.id] = bullet;

			// inform server if on local player
			// local player controls the spawn
			if(player.isLocalPlayer)
				Game.sendCreateBullet(bullet);

		}

		// remove a bullet from game
		// if local player, informs the server to broadcast
		player.removeBullet = function(bulletID){
			var bullet = player.bullets[bulletID];
			bullet.onRemove();
			
			// inform server if it is local player
			// local player controls the despawn
			if(player.isLocalPlayer)
				Game.sendRemoveBullet(bullet);

			delete player.bullets[bulletID];
		};


// --------------------------------------------
// Lifecycle
// --------------------------------------------
		player.netUpdate = function(){
			if(isLocalPlayer)
				Game.sendPlayerPos(player.x, player.y, player.direction);
		};

		player.update = function(){
			// local player
			if(player.isLocalPlayer){
				// applies collision
				var hit = game.physics.arcade.collide(player.sprite, Game.nonLocalPlayerGroup);

				// updates state
				player.playerfsm.update();
			}
			else{
				// sync pos
				player.posSync.onUpdate();
				
			}

			// update bullets
			Object.keys(player.bullets).forEach(function(key){
				player.bullets[key].update();
			});
		};


// --------------------------------------------
// Events
// --------------------------------------------
		player.events = {};
		player.events.lifeChange = new Phaser.Signal();


// --------------------------------------------
// Event handler
// --------------------------------------------
		// called when player is removed from game
		player.onRemove = function(){
			Object.keys(player.bullets).forEach(function(key){
				player.removeBullet(player.bullets[key].id);
			});

			networking.removeUpdate(player.netUpdate);
			player.sprite.destroy();
			player.playerfsm.onRemove();
		};

		// called when receiving position data from server
		player.onSyncPosition = function(x, y, direction){
			player.posSync.onSyncDataReceived(x,y);
			player.direction = direction;
			player.face();
		};

		// called when player respawn timer alerts
		player.onRespawnTimerRing = function(){
			if(player.isAlive)
				return;
			player.respawn(Game.randomInt(100, 400), Game.randomInt(100, 400));
		}


		return player;
	}
}