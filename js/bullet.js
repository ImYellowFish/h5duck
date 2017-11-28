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
			type = 'default';
			bulletTypeInfo = config.bulletType.default;
		}
		bullet.type = type;
		bullet.bulletTypeInfo = bulletTypeInfo;

		// bullet parameters
		bullet.spriteName = bulletTypeInfo.spriteName;
		bullet.damage = bulletTypeInfo.damage;
		bullet.penetrate = bulletTypeInfo.penetrate;

		// getters
		Object.defineProperty(bullet, "x", {get: function() { return this.sprite.x; }});
		Object.defineProperty(bullet, "y", {get: function() { return this.sprite.y; }});


// --------------------------------------------
// Initialization API
// --------------------------------------------
		// create physics for this bullet. called on local bullet only.
		bullet.setPhysics = function(vx, vy, gravity_y, drag){
			if(!bullet.sprite){
				console.error("no sprite found on bullet. Cannot set physics");
				return;
			}

			game.physics.arcade.enableBody(bullet.sprite);
			bullet.sprite.body.velocity.x = vx;
			bullet.sprite.body.velocity.y = vy;
			bullet.sprite.body.gravity.y = gravity_y;
			bullet.sprite.body.drag = drag;
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
		bullet.HitPlayer = function(player){
			bullet.player.dealDamage(player.id, bullet.damage);

			if(bullet.onHitCallback)
				bullet.onHitCallback(player);
			if(!bullet.penetrate){
				bullet.player.removeBullet(bullet.id);
			}
		};



// --------------------------------------------
// Lifecycle
// --------------------------------------------
		bullet.update = function(){
			// check for local bullets only
			// check whether this bullet hits other players
			if(bullet.isLocalBullet){
				Object.keys(Game.playerMap).forEach(function(key){
					bullet.checkCollision(Game.playerMap[key]);
				});
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
		bullet.sprite = game.add.sprite(x,y,bullet.spriteName);
		bullet.sprite.anchor.set(0.5);		

		// setup bullet pos synchronizer
		bullet.posSync = 
			networking.SpritePosSynchronizer.createNew(
				bullet.sprite);

		// for local bullet, destroy the bullet if out of bound.
		if(bullet.isLocalBullet){
			bullet.sprite.checkWorldBounds = true;
			bullet.sprite.events.onOutOfBounds.add(bullet.onOutOfBounds, this);
		}
		
		// for local bullet, setup physics
		if(bullet.isLocalBullet){
			bullet.setPhysics(
				bulletTypeInfo.velocityX * bullet.direction, 
				bulletTypeInfo.velocityY, 
				bulletTypeInfo.gravity, 
				bulletTypeInfo.drag);
		}
		return bullet;
	}
}