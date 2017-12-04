// class KillScrollView
var KillScrollView = {
	createNew : function(x, y, entryHeight, resKey, killIcon){
		var killScrollView = {};

		killScrollView.x = x;
		killScrollView.y = y;
		killScrollView.entryHeight = entryHeight;
		killScrollView.scale = config.uiKillScrollViewScale;

		killScrollView.count = 0;
		killScrollView.root = game.add.group(null, 'killScrollView', true);
		
		killScrollView.createEntry = function(victimName, killerName){
			var killerNameStyle = {font: '72px Arial', align: 'right', fill: "#FFFFFF"};
			var victimNameStyle = {font: '72px Arial', align: 'left', fill: "#FFFFFF"};

			var entry = {};

			var offsetY = -killScrollView.entryHeight * killScrollView.count;
			entry.bg = game.add.group();
			entry.bg.x = killScrollView.x;
			entry.bg.y = killScrollView.y + offsetY;
			entry.bg.scale.setTo(killScrollView.scale);
			entry.bg.alpha = config.uiKillScrollViewAlpha;
			
			entry.killer = game.add.text(350, 0, killerName, killerNameStyle);
			entry.killer.x -= entry.killer.width;
			entry.victim = game.add.text(570, 0, victimName, victimNameStyle);
			entry.icon = game.add.image(400, 0, resKey, killIcon);

			// entry.killer.fixedToCamera = true;
			// entry.victim.fixedToCamera = true;
			// entry.icon.fixedToCamera = true;

			entry.bg.add(entry.killer);
			entry.bg.add(entry.victim);
			entry.bg.add(entry.icon);

			killScrollView.root.add(entry.bg);
			killScrollView.count++;
			
			game.add.tween(killScrollView.root).to(
					{y:-offsetY}, 
					config.uiKillScrollViewMoveDuration, 
					Phaser.Easing.Linear.None,
					true, 0, 0, false
				);

			var tween = game.add.tween(entry.bg).to(
					{alpha:0},
					config.uiKillScrollViewVanishDuration, 
					Phaser.Easing.Linear.None,
					true, config.uiKillScrollViewVanishDelay, 0, false
				);
			tween.onComplete.add(function(){killScrollView.removeEntry(entry);});

			return entry;
		};

		killScrollView.removeEntry = function(entry){
			entry.bg.destroy(true);
		};

		return killScrollView;
	}
};