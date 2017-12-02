// --------------------------------------------
// Player class
// --------------------------------------------


var Player = {
// --------------------------------------------
// Constructor
// --------------------------------------------
	createNew : function(id, x, y, isLocalPlayer, type, playerName){

// --------------------------------------------
// Setup
// --------------------------------------------
		var player = {};
		player.id = id;
		player.isLocalPlayer = isLocalPlayer;
		player.name = playerName;

		// read player typeInfo
		var playerTypeInfo = config.playerType[type];
		if(!playerTypeInfo){
			type = "default";
			playerTypeInfo = config.playerType.default;
		}
		player.type = type;
		player.playerTypeInfo = playerTypeInfo;

		// --------------- initialize parameters ----------------------
		// flags
		// whether the player is waiting for respawn
		player.isAlive = true;

		// wheter the player is inside camera view
		player.isInView = true;

		// the killer of the player
		player.killerID = -1;

		// facing direction
		player.initDirection = config.playerInitFacingDir;
		player.direction = config.playerInitFacingDir;

		// player data
		// life
		player.maxLife = playerTypeInfo.maxLife;
		player.life = player.maxLife;
		if(config.debug && config.debugPlayerUnlimitedHP){
			player.maxLife = 999999;
			player.life = 999999;
		}
		
		// battle
		player.gunOffsetX = playerTypeInfo.gunOffsetX;
		player.gunOffsetY = playerTypeInfo.gunOffsetY;
		
		// timers
		const c_frameToTime = 1000 / 24;
		player.attackDuration = (playerTypeInfo.attackFrame+1) * c_frameToTime;
		player.onhitDuration = (playerTypeInfo.onhitFrame+1) * c_frameToTime;

		if(player.isLocalPlayer){
			player.zapProtection = Cooldown.createNew(config.playerZapProtection);
			player.shootCooldown = Cooldown.createNew(playerTypeInfo.shootCooldown, 0);
			player.moveStepCooldown = Cooldown.createNew(playerTypeInfo.moveStepCooldown, 0);
			player.respawnProtection = Cooldown.createNew(config.playerRespawnProtection);
		}

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
		sprite.data.player = player;

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
		
		// getters
		Object.defineProperty(player, "x", {
			get: function() { return this.sprite.x; },
			set: function(x) { this.sprite.x = x; }
		});
		Object.defineProperty(player, "y", {
			get: function() { return this.sprite.y; },
			set: function(y){ this.sprite.y = y;}
		});
		Object.defineProperty(player, "gun_x", {
			get: function() { return this.sprite.x + this.gunOffsetX * player.direction; },
			set: function(x) { this.gunOffsetX = (x - this.sprite.x) * player.direction; }
		});
		Object.defineProperty(player, "gun_y", {
			get: function() { return this.sprite.y + this.gunOffsetY; },
			set: function(y){ this.gunOffsetY = y - this.sprite.y;}
		});

		Object.defineProperty(player, "body", {get: function() { return this.sprite.body; }});
		Object.defineProperty(player, "protected", 
			{get: function() { return this.respawnProtection && this.respawnProtection.busy(); }});

		// player state
		player.playerfsm = PlayerFSM.createNew(player);
		player.playerfsm.init();

		// lifebar
		player.lifeBar = LifeBar.createNew(player);

		// position synchronizer
		player.posSync = 
			networking.SpritePosSynchronizer.createNew(
				player.sprite);

// --------------------------------------------
// Operations
// --------------------------------------------
		// make the player sprite face the right direction
		// can be called on both localplayer and nonlocal player
		player.face = function(){			
			player.sprite.scale.x = player.spriteScale * player.direction * player.initDirection;
		}

		// move for one step. Corresponds to one touch input.
		// local player only.
		player.moveStep = function(px, py){
			if(!player.isAlive || !player.playerfsm.canMove() || player.life <= 0)
				return;
			if(player.moveStepCooldown.busy()){
				return;
			}
			player.moveStepCooldown.reset();

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
			if(!player.isAlive || player.life <= 0 || !player.playerfsm.canFire()){				
				return;
			}
			if(player.protected)
				return;

			if(player.isLocalPlayer){
				// check cooldown
				if(player.shootCooldown.busy()){
					return;
				}

				player.shootCooldown.reset();
				
				player.createBullet(null, 
					player.gun_x, 
					player.gun_y, 
					player.direction, 
					player.bulletType);

				player.playerfsm.onFire();
			}
		};

		// deal damage to another player
		// called only on local player
		player.dealDamage = function(targetID, damage, onHitType, onHitPosX, onHitPosY){
			if(player.isLocalPlayer){
				Game.sendDealDamage(player.id, targetID, damage, onHitType, onHitPosX, onHitPosY);
			}
		};

		// reduce hp and check for death.
		// called when server tells to take damage, or when local player gets hit by traps
		// onhitType only required for localPlayer.
		player.takeDamage = function(sourceID, targetID, damage, onHitType, onHitPosX, onHitPosY){
			if(!player.isAlive || player.life <= 0 || !player.isInView){
				return;
			}
			if(player.protected)
				return;

			// create on hit effects
			if(!onHitType)
				onHitType = "default";

			var onHitData = config.onHitType[onHitType];
			if(onHitData.handledByFsm){
				// if onhit effect is handled by fsm, skip
			}else{
				effect.createfx(onHitPosX, onHitPosY, 1, onHitData.effect);
			}
			
			if(player.isLocalPlayer){
				// if localplayer, apply force
				if(onHitData.force > 0){
					var forceDir = new Phaser.Point(player.x - onHitPosX, player.y - onHitPosY);
					forceDir.setMagnitude(onHitData.force);
					player.sprite.body.velocity.add(forceDir.x, forceDir.y);
				}

				// if localplayer, reduce life
				// death check is handled by playerfsm
				// if player's life is zero, it will die when entering idle state
				console.log('take damage: ', damage, ', type: ', onHitType);

				// record the killing blow
				if(player.life <= damage){
					player.killerID = sourceID;
				}
				player.life = Math.max(0, player.life - damage);
				
				player.events.lifeChange.dispatch(player.life);
				player.playerfsm.onGetHit(onHitType);
			}
		};

		// triggered when player touches zap zone
		// localplayer only
		player.zap = function(){
			if(player.zapProtection.ready()){
				player.zapProtection.reset();
				player.takeDamage(player.id, player.id, 10, "zaphit", player.x, player.y);
				player.sprite.body.velocity.setTo(0);
			}
		}

		player.die = function(killerID){
			if(!player.isAlive)
				return;

			player.life = 0;
			player.isAlive = false;
			console.log("player is dead: " + player.id);

			if(player.isLocalPlayer){
				// change state
				player.playerfsm.goto("die");
				
				// stop velocity
				player.sprite.body.velocity.setTo(0, 0);

				// delay respawn
				game.time.events.add(config.playerRespawnDelay, player.onRespawnTimerRing, this);

				// if local, informs server
				Game.sendPlayerDie(player.id, killerID);		
				
				// display killer info
				console.log("you are killed by Player " + killerID);

				// camera fade
				game.camera.fade("#000000", 1000, true, config.cameraDeadScreenAlpha);
			}
		};

		
		player.respawn = function(x, y){
			console.log('player respawned.');
			player.isAlive = true;
			player.life = player.maxLife;
			player.x = x;
			player.y = y;
			
			if(player.lifeBar)
				player.lifeBar.reset();

			if(player.isLocalPlayer){
				Game.sendPlayerRespawn(player.id, x, y);
				player.events.lifeChange.dispatch(player.life);
				player.playerfsm.onRespawn();

				// respawn protection
				player.respawnProtection.reset();
				player.respawnProtectionFlicker();
			}else{
				player.posSync.reset(x, y);
			}

			// camera fade to normal
			game.camera.flash("#000000", 500, true, config.cameraDeadScreenAlpha);
		};

		// register network update
		player.registerNetUpdate = function(){
			networking.registerUpdate(player.netUpdate);
		};

		player.respawnProtectionFlicker = function(){
			player.sprite.alpha = 1;
			game.add.tween(player.sprite).to({alpha: 0}, 
				config.playerRespawnProtection / config.playerRespawnProtectionRepeat / 2, 
				"Linear", true, 0, config.playerRespawnProtectionRepeat, true);
		}

		
// --------------------------------------------
// Bullet management
// --------------------------------------------
		// bullets
		player.bullets = {};

		// create a bullet with custom parameters.
		// if local player, informs the server to broadcast
		// pass null as bulletID for local players.
		player.createBullet = function(bulletID, x, y, direction, type){
			// do not create bullet if it is not in camera view.
			// bullets at camera bounds will be created when it comes into game view.
			if(!Game.isPosInView(x, y))
				return;

			if(!type)
				type = player.bulletType;

			var bullet = Bullet.createNew(player.id, bulletID, x, y, direction, type);
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
			if(!bullet)
				return;

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
				Game.sendPlayerPos(player.x, player.y, player.direction, player.life);
		};

		player.update = function(){
			// local player
			if(player.isLocalPlayer){
				// applies collision
				var hitOtherPlayers = game.physics.arcade.collide(player.sprite, Game.nonLocalPlayerGroup);
				var hitLevelBlocks = game.physics.arcade.collide(player.sprite, Game.level.blockGroup);
				var hitZaps = game.physics.arcade.overlap(player.sprite, Game.level.zapGroup, function(p1, p2){
					player.zap();
				});
				
				// update timers and cooldowns
				player.moveStepCooldown.tick();
				player.zapProtection.tick();
				player.shootCooldown.tick();
				player.respawnProtection.tick();
			}
			else{
				// sync pos if player is visible
				player.posSync.onUpdate();
			}

			// updates state
			player.playerfsm.update();

			// update bullets
			Object.keys(player.bullets).forEach(function(key){
				player.bullets[key].update();
			});

			// update lifeBar
			if(player.lifeBar)
				player.lifeBar.update();

			// check entangle state
			if(player.playerfsm.entangled()){
				player.sprite.body.velocity.setTo(0);
			}

			// check visiblity
			if(!player.protected){
				if(player.playerfsm.visible() && player.isAlive && player.isInView){
					player.sprite.alpha = 1;
				}else{
					player.sprite.alpha = 0;
				}
			}

			// TODO: optimize bullet collision detection so this can be enabled
			// player.sprite.visible = player.isInView;
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
			if(player.lifeBar)
				player.lifeBar.onRemove();
		};

		// called when receiving position data from server
		player.onSyncPosition = function(x, y, direction, life){
			if(!player)
				return;

			// cull sprite if not in view
			player.isInView = Game.isPosInView(x, y);
			player.posSync.onSyncDataReceived(x,y);
			player.direction = direction;
			player.life = life;
			player.face();
		};

		// called when player respawn timer alerts
		player.onRespawnTimerRing = function(){
			if(player.isAlive)
				return;
			player.respawn(Game.randomInt(100, 400), Game.randomInt(100, 400));
		}

		// flicker when player respawns
		if(player.isLocalPlayer)
			player.respawnProtectionFlicker();

		return player;
	}
}