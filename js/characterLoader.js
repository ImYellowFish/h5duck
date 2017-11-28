var characterLoader = {
	preload : function(){

	},

	preloadSpriteSheet : function(key, spriteSheetName){
		var texName = "assets/sprites/sprite_" + spriteSheetName + ".png";
		var jsonName = "assets/sprites/sprite_" + spriteSheetName + ".json";
		game.load.atlasJSONHash(key, texName, jsonName);
	},

	addAnimation : function(sprite, spriteSheetName, anim, anim_config){
		var animPrefix = spriteSheetName + "/" + anim + "/"; 
		var length = anim_config[anim].length;
		sprite.animations.add(anim, Phaser.Animation.generateFrameNames(animPrefix, 0, length, '.png', 0), 
			config.playerAnimationFramerate, anim_config[anim].loop, false);
		// console.log("animations: " + Phaser.Animation.generateFrameNames(animPrefix, 0, length, '', 0));
		// console.log("anim: " + anim);
	},

	createCharacterSprite : function(x, y, key){
		var default_frame = key + "/" + config.playerAnimationDefaultFrame;
		var sprite = game.add.sprite(x, y, key, default_frame);
		Object.keys(config.playerAnimation).forEach(function(anim){
			characterLoader.addAnimation(sprite, key, anim, config.playerAnimation);
		});
		
		return sprite;
	},

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
	}

}