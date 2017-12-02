var characterLoader = {

// --------------------------------------------
// API
// --------------------------------------------
	preloadSpriteSheet : function(key, spriteSheetName){
		var texName = "assets/sprites/sprite_" + spriteSheetName + ".png";
		var jsonName = "assets/sprites/sprite_" + spriteSheetName + ".json";
		game.load.atlasJSONHash(key, texName, jsonName);
	},
	
	createCharacterSprite : function(x, y, key){
		var default_frame = key + "/" + config.playerAnimationDefaultFrame;
		var sprite = game.add.sprite(x, y, key, default_frame);
		Object.keys(config.playerAnimation).forEach(function(anim){
			characterLoader.addAnimation(sprite, key, anim, config.playerAnimation);
		});
		
		return sprite;
	},

	createBulletSprite : function(x, y, key){
		var default_frame = "z_bullet/" + key + "/" + config.bulletAnimationDefaultFrame;
		var sprite = characterLoader.getBulletPoolSprite(x, y, key, 'bullet', default_frame);

		// add animation if there is none existing
		if(!sprite.data.animation){
			var animPrefix = "z_bullet" + "/" + key + "/";
			var anim_config = config.bulletType[key];
			
			var animation = 
				sprite.animations.add(
					'idle', 
					Phaser.Animation.generateFrameNames(animPrefix, 0, anim_config.length, '.png', 0), 
					config.bulletAnimationFramerate, anim_config.loop, false);

			// mark animation as added
			sprite.data.animation = animation;
		}

		sprite.animations.play('idle');

		return sprite;
	},

// --------------------------------------------
// Helper
// --------------------------------------------
	addAnimation : function(sprite, spriteSheetName, anim, anim_config){
		var animPrefix = spriteSheetName + "/" + anim + "/"; 
		var length = anim_config[anim].length;
		sprite.animations.add(anim, Phaser.Animation.generateFrameNames(animPrefix, 0, length, '.png', 0), 
			config.playerAnimationFramerate, anim_config[anim].loop, false);
		// console.log("animations: " + Phaser.Animation.generateFrameNames(animPrefix, 0, length, '', 0));
		// console.log("anim: " + anim);
	},

	// bullet pooling
	bulletPool : {},
	getBulletPoolSprite : function(x, y, poolKey, spriteKey, spriteFrame){
		if(!characterLoader.bulletPool[poolKey]){
			characterLoader.bulletPool[poolKey] = game.add.group();
		}
		var pool = characterLoader.bulletPool[poolKey];
		var sprite = pool.getFirstDead(true, x, y, spriteKey, spriteFrame);
		return sprite;
	},

// --------------------------------------------
// Test
// --------------------------------------------
	testAnimation : function(){
		// test
		var testAnim = "onhit1";
		var testDelay = 1000;

		var test0 = characterLoader.createCharacterSprite(300, 300, "black");
		game.time.events.add(testDelay, function(){test0.animations.play(testAnim);}, this);	

		var test1 = characterLoader.createCharacterSprite(0, 300, "red");
		game.time.events.add(testDelay, function(){test1.animations.play(testAnim);}, this);	

		var test2 = characterLoader.createCharacterSprite(600, 300, "yellow");
		game.time.events.add(testDelay, function(){test2.animations.play(testAnim);}, this);	

		var test3 = characterLoader.createCharacterSprite(900, 300, "blue");
		game.time.events.add(testDelay, function(){test3.animations.play(testAnim);}, this);

		characterLoader.createBulletSprite(300, 500, "missile");
		characterLoader.createBulletSprite(0, 500, "shotgun");

	}

}