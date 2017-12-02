var LifeBar = {
	createNew : function(player){
		var lifeBar = {};
		lifeBar.player = player;
		
		lifeBar.reset = function(){
			lifeBar.value = 1;
			lifeBar.desiredValue = 1;
			lifeBar.mgValue = 1;
		}

		lifeBar.update = function() {
			var visible = lifeBar.player.isInView &&
					lifeBar.player.isAlive && 
					(lifeBar.player.life < lifeBar.player.maxLife || lifeBar.player.isLocalPlayer);
			lifeBar.bgSprite.visible = visible;
			if(!visible)
				return;

			// update position
			// lifeBar.updatePos(lifeBar.sprite, lifeBar.initWidth);
			lifeBar.updatePos(lifeBar.bgSprite, lifeBar.bgSprite.width);

			// update value and display
			lifeBar.desiredValue = lifeBar.player.life / lifeBar.player.maxLife;
			lifeBar.value = lifeBar.lerpValue(lifeBar.value, lifeBar.desiredValue, lifeBar.changeSpeed);
			lifeBar.mgValue = lifeBar.lerpValue(lifeBar.mgValue, lifeBar.desiredValue, lifeBar.mgChangeSpeed);

			lifeBar.cropRect.width = lifeBar.initWidth * lifeBar.value;
			lifeBar.mgCropRect.width = lifeBar.initWidth * lifeBar.mgValue;
			lifeBar.sprite.updateCrop();
			lifeBar.mgSprite.updateCrop();
		};

		lifeBar.onRemove = function(){
			if(lifeBar.bgSprite){
				lifeBar.bgSprite.destroy();
			}

			if(lifeBar.mgSprite){
				lifeBar.mgSprite.destroy();
			}

			lifeBar.sprite.destroy();
		};

		lifeBar.initBgSprite = function(_sprite){
			_sprite.anchor.setTo(0, 1);
			_sprite.scale.setTo(lifeBar.scale);
			lifeBar.updatePos(_sprite, _sprite.width);
		};

		lifeBar.updatePos = function(_sprite, width){
			_sprite.x = player.x - width / 2 + config.uiLifeBarOffsetX;
			_sprite.y = player.y + _sprite.height / 2 + config.uiLifeBarOffsetY;
		}

		lifeBar.lerpValue = function(current, desired, speed){
			if(current > desired){
				current = Math.max(current - speed, desired);
			}
			return current;
		}

		lifeBar.desiredValue = 1;
		lifeBar.value = 1;
		lifeBar.mgValue = 1;
		
		lifeBar.changeSpeed = config.uiLifeBarPlayerSpeed;
		lifeBar.mgChangeSpeed = config.uiLifeBarPlayerMgSpeed;

		lifeBar.scale = config.uiLifeBarScale;

		lifeBar.bgSprite = game.add.sprite(0, 0, 'ui', 'hpBarBgPlayer.png');
		lifeBar.initBgSprite(lifeBar.bgSprite);
		
		lifeBar.mgSprite = game.add.image(0, 0, 'ui', 'hpBarEnemy.png');
		lifeBar.mgSprite.anchor.setTo(0, 1);

		var spriteName = 'hpBarPlayer.png';
		if(!lifeBar.player.isLocalPlayer){
			var spriteName = 'hpBarEnemy.png';
			lifeBar.mgSprite.visible = false;
			lifeBar.changeSpeed = config.uiLifeBarEnemySpeed;
		}

		lifeBar.sprite = game.add.image(0, 0, 'ui', spriteName);
		lifeBar.sprite.anchor.setTo(0, 1);
		
		lifeBar.bgSprite.addChild(lifeBar.mgSprite);
		lifeBar.bgSprite.addChild(lifeBar.sprite);
		
		lifeBar.initWidth = lifeBar.sprite.width;
		
		lifeBar.cropRect = new Phaser.Rectangle(0, 0, lifeBar.sprite.width, lifeBar.sprite.height);
		lifeBar.mgCropRect = new Phaser.Rectangle(0, 0, lifeBar.sprite.width, lifeBar.sprite.height);
		lifeBar.sprite.crop(lifeBar.cropRect);
		lifeBar.mgSprite.crop(lifeBar.mgCropRect);

		return lifeBar;
	}
}