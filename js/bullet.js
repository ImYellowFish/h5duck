// bullet class
var Bullet = {
// --------------------------------------------
// Bullet ID Management
// --------------------------------------------
	lastBulletID: 0,

	// generate a new bullet ID for this player
	getNewBulletID: function(playerID){
		Bullet.lastBulletID++;
		return playerID * config.maxBulletID + (Bullet.lastBulletID % config.maxBulletID);
	},

// --------------------------------------------
// Properties
// --------------------------------------------
	createNew: function(playerID, bulletID, x, y, direction, type){
		var bullet = {};
		// basic info
		bullet.id = bulletID;
		bullet.playerID = playerID;
		bullet.player = Game.playerMap[playerID];
		bullet.isLocalBullet = bullet.player.isLocalPlayer;
		if(bullet.isLocalBullet){
			bullet.id = Bullet.getNewBulletID(playerID);
		}

		bullet.direction = direction;
		
		// type info
		var bulletTypeInfo = config.bulletType[type];
		if(!bulletTypeInfo){
			type = config.defaultBulletType;
			bulletTypeInfo = config.bulletType[type];
		}
		bullet.type = type;
		bullet.bulletTypeInfo = bulletTypeInfo;

		// bullet parameters
		bullet.spriteName = bulletTypeInfo.spriteName;
		bullet.followPlayer = bulletTypeInfo.followPlayer;
		bullet.scale = bulletTypeInfo.scale;
		bullet.damage = bulletTypeInfo.damage;
		bullet.penetrate = bulletTypeInfo.penetrate;
		bullet.onHitType = bulletTypeInfo.onHitType;
		bullet.friendlyFire = bulletTypeInfo.friendlyFire;
		bullet.recoil = bulletTypeInfo.recoil;

		// getters
		Object.defineProperty(bullet, "x", {get: function() { return this.sprite.x; }});
		Object.defineProperty(bullet, "y", {get: function() { return this.sprite.y; }});

		// timer
		bullet.friendlyFireProtection = Cooldown.createNew(config.bulletFriendlyFireProtection);

// --------------------------------------------
// Initialization API
// --------------------------------------------
		// create physics for this bullet. called on local bullet only.
		bullet.setPhysics = function(vx, vy, gravity_y, drag, bounce, collideWithBlocks){
			if(!bullet.sprite){
				console.error("no sprite found on bullet. Cannot set physics");
				return;
			}

			game.physics.arcade.enableBody(bullet.sprite);
			bullet.sprite.body.velocity.x = vx;
			bullet.sprite.body.velocity.y = vy;
			bullet.sprite.body.gravity.y = gravity_y;
			bullet.sprite.body.bounce.setTo(bounce);
			bullet.sprite.body.drag.setTo(drag);

			bullet.collideWithBlocks = collideWithBlocks;
		};

		// add extra callback when bullet hits target.
		bullet.setOnHit = function(onHitCallback){
			bullet.onHitCallback = onHitCallback;
		}


// --------------------------------------------
// Operations
// --------------------------------------------
		// register this bullet for network update.
		// after this, bullet.netUpdate will get called by networking system.
		bullet.registerNetUpdate = function(){
			// register netUpdate
			networking.registerUpdate(bullet.netUpdate);
		}

		// check bullet collision against a player
		bullet.checkCollision = function(player){
			// do not check against local player
			if(player && !player.isLocalPlayer && player.isAlive){
				var hit = game.physics.arcade.overlap(bullet.sprite, player.sprite);
				if(hit){
					bullet.HitPlayer(player);
				}
			}
		};	

		// hit a player; do damage and other effect.
		bullet.HitPlayer = function(bulletSprite, playerSprite){
			var player = playerSprite.data.player;

			// mark damaged players, so we hit them only once.
			if(bullet.damagedPlayers[player.id])
				return;
			bullet.damagedPlayers[player.id] = 1;

			var damage = bullet.damage;
			if(bullet.player.id == player.id)
				damage = bullet.damage * config.bulletFriendlyFireDamageFactor;

			// damage the player
			bullet.player.dealDamage(player.id, 
				damage, 
				bullet.onHitType, 
				game.math.average(player.x, bullet.x), 
				game.math.average(player.y, bullet.y));

			// on hit callback
			if(bullet.onHitCallback)
				bullet.onHitCallback(player);

			// if not penetrate, destroy the bullet.
			if(!bullet.penetrate){
				bullet.player.removeBullet(bullet.id);
			}
		};

		bullet.HitBlock = function(){
			if(bullet.bulletTypeInfo.bounceRandomY){
				var randomY = bullet.bulletTypeInfo.bounceRandomY;
				bullet.sprite.body.velocity.y += Game.randomSign() * randomY;
			}
			if(bullet.bulletTypeInfo.splitWhenCollideBlocks){
				bullet.player.removeBullet(bullet.id);
				var spawns = bullet.bulletTypeInfo.splitSpawns;
				for(var i = 0; i < spawns.length; i++){
					bullet.player.createBullet(null, bullet.x, bullet.y, -bullet.direction, spawns[i]);					
				}			
			}else if(bullet.bulletTypeInfo.destroyWhenCollideBlocks && 
					(bullet.sprite.body.touching.left || bullet.sprite.body.touching.right)){
				bullet.player.removeBullet(bullet.id);
			}
		}


// --------------------------------------------
// Lifecycle
// --------------------------------------------
		bullet.update = function(){
			// check for local bullets only
			// check whether this bullet hits other players
			if(bullet.isLocalBullet){
				if(bullet.followPlayer){
					bullet.sprite.x = bullet.player.gun_x;
					bullet.sprite.y = bullet.player.gun_y;
				}

				bullet.friendlyFireProtection.tick();
				if(bullet.friendlyFire && bullet.friendlyFireProtection.ready()){
					game.physics.arcade.overlap(bullet.sprite, bullet.player.sprite, bullet.HitPlayer);
				}

				game.physics.arcade.overlap(bullet.sprite, Game.nonLocalPlayerGroup, bullet.HitPlayer);
				if(bullet.collideWithBlocks)
					game.physics.arcade.collide(bullet.sprite, Game.level.blockGroup, bullet.HitBlock);
			}else{
				bullet.posSync.onUpdate();

				// out of sync, remove this bullet
				if(bullet.posSync.timeSinceLastUpdate() > config.bulletSyncTimeOut){
					bullet.player.removeBullet(bullet.id);
				}
			}
		};

		// called in every network update.
		bullet.netUpdate = function(){
			if(bullet.isLocalBullet){
				// upload bullet pos
				Game.sendBulletSync(bullet);
			}
		}


// --------------------------------------------
// Event handlers
// --------------------------------------------
		bullet.onRemove = function(){
			// console.log("remove bullet: " + bullet.id);

			networking.removeUpdate(bullet.netUpdate);
			bullet.sprite.kill();
		};
		
		bullet.onOutOfBounds = function(){
			bullet.player.removeBullet(bullet.id);
		};

		bullet.onSyncStatus = function(x, y){
			bullet.posSync.onSyncDataReceived(x, y);
		}


// --------------------------------------------
// Initialization
// --------------------------------------------
		// setup sprite		
		bullet.sprite = characterLoader.createBulletSprite(x, y, bullet.spriteName);
		bullet.sprite.anchor.set(bulletTypeInfo.anchorX, bulletTypeInfo.anchorY);
		bullet.sprite.scale.x = bullet.scale * bullet.direction * bulletTypeInfo.direction;
		bullet.sprite.scale.y = bullet.scale;
		
		// setup bullet pos synchronizer
		bullet.posSync = 
			networking.SpritePosSynchronizer.createNew(
				bullet.sprite);

		// for local bullet, destroy the bullet if out of bound.
		if(bullet.isLocalBullet){
			bullet.sprite.checkWorldBounds = true;
			bullet.sprite.events.onOutOfBounds.add(bullet.onOutOfBounds, this);
		}

		// auto remove bullet after duration
		if(bullet.isLocalBullet){
			if(bulletTypeInfo.duration > 0){
				game.time.events.add(
					bulletTypeInfo.duration, 
					function(){ 
						if(bullet){
							bullet.player.removeBullet(bullet.id);
						}
					}, 
					this);
			}
		}
		
		// record damaged players
		// won't damage a player for a second time
		if(bullet.isLocalBullet){
			bullet.damagedPlayers = {};
		}

		// for local bullet, setup physics, set autodestroy
		if(bullet.isLocalBullet){
			var vx = bulletTypeInfo.velocityX * bullet.direction;
			var vy = bulletTypeInfo.velocityY;
			
			bullet.setPhysics(vx, vy,
				bulletTypeInfo.gravity, 
				bulletTypeInfo.drag,
				bulletTypeInfo.bounce, 
				bulletTypeInfo.collideWithBlocks);

			if(bulletTypeInfo.useCustomHitBox){
				bullet.sprite.body.setSize(bulletTypeInfo.hitBoxWidth, bulletTypeInfo.hitBoxHeight, 
							bulletTypeInfo.hitBoxOfffsetX, bulletTypeInfo.hitBoxOfffsetY);
			}

			if(bullet.recoil){
				bullet.player.sprite.body.velocity.x += (-bullet.direction * bullet.recoil);
			}

		}

		return bullet;
	}
}