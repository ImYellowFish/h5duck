var UI = {};

UI.ready = false;

UI.preload = function(){
	game.load.spritesheet('dirbutton', 'assets/sprites/dirbutton.png', 32, 32);
}

UI.create = function(){
	// buttons
	UI.leftButton = game.add.button(Game.width * 0.2, Game.height * 0.8, 'dirbutton', null, this, 0, 0, 0);
	UI.leftButton.scale.setTo(2, 2);
	UI.leftButton.events.onInputDown.add(UI.onLeftDown, this);
	UI.leftButton.events.onInputUp.add(UI.onLeftUp, this);
	UI.leftButton.update = UI.onLeftUpdate;
	
	UI.rightButton = game.add.button(Game.width * 0.3, Game.height * 0.8, 'dirbutton', null, this, 1, 1, 1);
	UI.rightButton.scale.setTo(2, 2);
	UI.rightButton.events.onInputDown.add(UI.onRightDown, this);
	UI.rightButton.events.onInputUp.add(UI.onRightUp, this);
	UI.rightButton.update = UI.onRightUpdate;

	UI.fireButton = game.add.button(Game.width * 0.7, Game.height * 0.8, 'dirbutton', UI.onClickFire, this, 0, 0, 0);
	UI.fireButton.scale.setTo(2, 2);

	// displays
	UI.playerLife = game.add.text(Game.width * 0.1, Game.height * 0.1, 'Life: ', { font: "25px Arial", fill: "#ff0044", align: "center" });

	UI.ready = true;
	
	Game.localPlayer.events.lifeChange.add(UI.onPlayerLifeChange);
	UI.onPlayerLifeChange(Game.localPlayer.life);
}


// internal UI events
UI.onPlayerLifeChange = function(newLife){
	if(UI.ready){
		UI.playerLife.text = 'Life: ' + newLife;
	}
}

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

