var UI = {};

UI.ready = false;

UI.preload = function(){
	// game.load.atlasJSONHash('ui', 'assets/sprites/ui.png', 'assets/sprites/ui.json');
}

UI.create = function(){
	var btnScale = config.uiButtonScale;

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

	// displays
	UI.ready = true;
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

