var UI = {};

UI.ready = false;
UI.changeButtonCooldown = Cooldown.createNew(config.uiChangePlayerTypeCooldown);

UI.preload = function(){
	// game.load.atlasJSONHash('ui', 'assets/sprites/ui.png', 'assets/sprites/ui.json');
}

UI.create = function(){
	var btnScale = config.uiButtonScale;

	UI.createMidRank();
	UI.rankSelfName.text = Game.localPlayerName;

	UI.killScrollView = KillScrollView.createNew(1050, 50, 50, 'ui', 'kill.png');

	// buttons
	UI.leftButton = game.add.button(Game.width * 0.05, Game.height * 0.75, 'ui', null, this, 
		'left.png', 'left.png', 'leftdown.png', 'left.png');
	UI.leftButton.scale.setTo(btnScale);
	UI.leftButton.events.onInputDown.add(UI.onLeftDown, this);
	UI.leftButton.events.onInputUp.add(UI.onLeftUp, this);
	UI.leftButton.update = UI.onLeftUpdate;
	UI.leftButton.fixedToCamera = true;

	UI.rightButton = game.add.button(Game.width * 0.2, Game.height * 0.75, 'ui', null, this, 
		'right.png', 'right.png', 'rightdown.png', 'right.png');
	UI.rightButton.scale.setTo(btnScale);
	UI.rightButton.events.onInputDown.add(UI.onRightDown, this);
	UI.rightButton.events.onInputUp.add(UI.onRightUp, this);
	UI.rightButton.update = UI.onRightUpdate;
	UI.rightButton.fixedToCamera = true;

	UI.fireButton = game.add.button(Game.width * 0.85, Game.height * 0.85, 'ui', UI.onClickFire, this, 
		'atk.png', 'atk.png', 'atkdown.png', 'atk.png');
	UI.fireButton.anchor.setTo(0.5, 0.5);
	UI.fireButton.scale.setTo(btnScale);
	UI.fireButton.fixedToCamera = true;

	UI.changeButton = game.add.button(Game.width * 0.05, Game.height * 0.05, 'ui', UI.onChangePlayer, this, 
		'rankBg04.png', 'rankBg04.png', 'rankBg03.png', 'rankBg04.png');
	UI.changeButton.anchor.setTo(0.5, 0.5);
	UI.changeButton.scale.setTo(0.25, 0.8);
	UI.changeButton.alpha = 0.6;
	UI.changeButton.fixedToCamera = true;

	UI.changeButtonText = game.add.text(25, 20, "Switch", {font: '24px Arial', align: 'left', fill: "#FFFFFF", fontStyle: "italic"});
	UI.changeButtonText.fixedToCamera = true;

	var gameTimerStyle = {font: '36px Arial', align: 'left', fill: "#FFFFFF", fontStyle: "italic"};
	UI.gameTimer = game.add.text(620, 15, "00:00", gameTimerStyle);
	UI.gameTimer.fixedToCamera = true;

	// displays
	UI.ready = true;
}


// Game API

UI.update = function(){
	UI.changeButtonCooldown.tick();
	UI.updateTimer();
}

UI.onGameScoreChanged = function(selfScore, selfName){
}

UI.onGameRankChanged = function(selfRank, selfName, selfScore, leaderName, leaderScore){
	UI.rankSelfRank.text = selfRank;
	UI.rankSelfName.text = selfName;
	UI.rankSelfScore.text = selfScore;
	UI.rankLeaderName.text = leaderName;
	UI.rankLeaderScore.text = leaderScore;
}

UI.onPlayerDie = function(victimID, killerID){
	if(!Game.playerMap[killerID] || !Game.playerMap[victimID])
		return;

	var victimName = Game.playerMap[victimID].name;
	var killerName = Game.playerMap[killerID].name;
	UI.killScrollView.createEntry(victimName, killerName);
}



// internal UI events
UI.onLeftDown = function(){
	UI.isLeftBtnDown = true;	
};

UI.onLeftUp = function(){
	UI.isLeftBtnDown = false;
}

UI.onLeftUpdate = function(){
	if(UI.isLeftBtnDown){
		Game.movePlayer(-10000, 0);
	}
}

UI.onRightDown = function(){
	UI.isRightBtnDown = true;
}

UI.onRightUp = function(){
	UI.isRightBtnDown = false;
}

UI.onRightUpdate = function(){	
	if(UI.isRightBtnDown){
		Game.movePlayer(10000, 0);
	}
}

UI.onClickFire = function(){
	Game.localPlayer.fire(0);
	
}

UI.onChangePlayer = function(){
	if(UI.changeButtonCooldown.busy())
		return;
	UI.changeButtonCooldown.reset();

	Game.changePlayerType(
		Game.localPlayerID, 
		Game.localPlayer.x, 
		Game.localPlayer.y, 
		true, 
		Game.nextPlayerType(Game.localPlayer.type), 
		Game.localPlayerName);
}

// UI panels
UI.createMidRank = function(){
	var rankStyle = {font: '72px Arial', align: 'left', fill: "#FFFFFF", fontStyle: "italic"};
	var nameStyle = {font: '48px Arial', align: 'left', fill: "#FFFFFF", fontStyle: "italic"};
	var scoreStyle = {font: '48px Arial', align: 'left', fill: "#FFFFFF", fontStyle: "italic"};

	UI.rankLeader = game.add.image(500 * config.gameWindowScale, 50 * config.gameWindowScale, 'ui', 'rankBg04.png');
	UI.rankLeaderRank = game.add.text(10, 0, "1", rankStyle);
	UI.rankLeaderName = game.add.text(100, 15, "??????", nameStyle);
	UI.rankLeaderScore = game.add.text(520, 15, "0", scoreStyle);
	
	UI.rankLeader.addChild(UI.rankLeaderRank);
	UI.rankLeader.addChild(UI.rankLeaderName);
	UI.rankLeader.addChild(UI.rankLeaderScore);
	UI.rankLeader.scale.setTo(config.uiRankScale);
	UI.rankLeader.fixedToCamera = true;
	

	UI.rankSelf = game.add.image(500 * config.gameWindowScale, 85 * config.gameWindowScale, 'ui', 'rankBg03.png');
	UI.rankSelf.scale.setTo(config.uiRankScale);
	UI.rankSelfRank = game.add.text(10, 0, "?", rankStyle);
	UI.rankSelfName = game.add.text(100, 15, "??????", nameStyle);
	UI.rankSelfScore = game.add.text(520, 15, "0", scoreStyle);
	UI.rankSelf.addChild(UI.rankSelfRank);
	UI.rankSelf.addChild(UI.rankSelfName);
	UI.rankSelf.addChild(UI.rankSelfScore);
	UI.rankSelf.scale.setTo(config.uiRankScale);
	UI.rankSelf.fixedToCamera = true;


}

UI.updateTimer = function(){
	var totalSeconds = config.gameDurationInSeconds - Math.floor((Date.now() - Game.startTime) / 1000);
	var min = Math.max(0, Math.floor(totalSeconds / 60));
	var sec = Math.max(0, totalSeconds - 60 * min);
	UI.gameTimer.text = min.toString() + ":" + sec.toString(); 
}