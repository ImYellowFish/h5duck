var effect = {};

effect.preload = function(){
	game.load.atlasJSONHash('effect', 'assets/sprites/effect.png', 'assets/sprites/effect.json');
}

effect.createPool = function(){
	effect.pool = game.add.group();
}

effect.createfx = function(x, y, direction, key){
	var ec = config.effectType[key];
	var sprite = effect.getPoolSprite(x, y, key, 'effect', ec.key + '/0.png');
	sprite.revive();
	sprite.anchor.setTo(ec.anchorX, ec.anchorY);
	sprite.scale.setTo(ec.scale * direction, ec.scale);

	if(!sprite.data.animation){
		// add animations if not existing
		var animPrefix = ec.key + '/';
		var animation = sprite.animations.add('idle', 
			effect.getAnimFrameNames(ec), 
			ec.framerate, ec.loop != 0, false);
		sprite.data.animation = animation;

		animation.killOnComplete = true;

		if(ec.loop > 0){
			animation.onLoop.add(function(){
				if(animation.loopCount >= ec.loop - 1){
					sprite.kill();
				}
			});
		}else{
			// ec.loop < 0, this effect lasts forever
		}

		sprite.animations.play('idle');

	}else{
		sprite.data.animation.restart();
	}
	
	return sprite;
}

effect.test = function(){
	game.input.onDown.add(function(){
		effect.createfx(100, 300, 1, 'bladehit');
		effect.createfx(300, 300, 1, 'blasthit');
		effect.createfx(500, 300, 1, 'forkhit');
		effect.createfx(700, 300, 1, 'die');
		effect.createfx(900, 300, 1, 'zaphit');
	});
}


effect.pools = {};
effect.getPoolSprite = function(x, y, poolKey, spriteKey, spriteFrame){
	if(!effect.pools[poolKey]){
		effect.pools[poolKey] = game.add.group();
	}
	var pool = effect.pools[poolKey];
	var sprite = pool.getFirstDead(true, x, y, spriteKey, spriteFrame);
	return sprite;
}

effect.getAnimFrameNames = function(effectConfig){
	var animPrefix = effectConfig.key + '/';
	if(effectConfig.needPause){
		var animStart = Phaser.Animation.generateFrameNames(animPrefix, 0, effectConfig.frameStart - 1, '.png', 0);
		var animPause = new Array(effectConfig.framePause);
		animPause.fill(animStart[animStart.length - 1]);
		var animEnd = Phaser.Animation.generateFrameNames(animPrefix, effectConfig.frameStart, effectConfig.frame, '.png', 0);
		return animStart.concat(animPause, animEnd);
	}else{
		return Phaser.Animation.generateFrameNames(animPrefix, 0, effectConfig.frame, '.png', 0);
	}
}