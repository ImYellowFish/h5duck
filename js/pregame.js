var PreGame = {};

// --------------------------------------------
// Loading
// --------------------------------------------



// --------------------------------------------
// Lifecycle
// --------------------------------------------

PreGame.preload = function() {
	game.load.atlasJSONHash('ui', 'assets/sprites/ui.png', 'assets/sprites/ui.json');
}

PreGame.create = function(){
	game.add.plugin(PhaserInput.Plugin);

	// resize the game
	PreGame.resize();

	// show login
	PreGame.inputUserName = 
		game.add.inputField(250, 0, {
		    font: '56px Arial',
		    fill: '#212121',
		    fontWeight: 'bold',
		    width: 350,
		    padding: 8,
		    borderWidth: 1,
		    borderColor: '#000',
		    borderRadius: 6,
		    placeHolder: '昵称:',
		    type: PhaserInput.InputType.text,
		});
	
	PreGame.loginButton = game.add.button(400, 200, 'ui', PreGame.onLoginButton, this, 
		'confirm.png', 'confirm.png', 'confirmdown.png', 'confirm.png');
	PreGame.loginButton.anchor.setTo(0.5, 0.5);
	PreGame.loginButton.scale.setTo(0.4, 0.4);

	// PreGame.loginButtonText = game.add.text(PreGame.loginButton.centerX, 
	// 	PreGame.loginButton.centerY, "开始");
	// PreGame.loginButtonText.anchor.setTo(0.5, 0.5);
	
	if(config.debug && config.debugSkipLogin){
		Game.localPlayerName = "test" + Game.randomInt(1, 300);
		game.state.start('Game');
	}
}

PreGame.update = function(){
	// if(PreGame.isCorrectOrientation()){
	// 	game.state.start('Game');
	// }

}

// --------------------------------------------
// Screen resize
// --------------------------------------------

PreGame.resize = function(){
	if (game.device.desktop)
	 { 
		 game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		 game.scale.minWidth = Game.width / 2;
		 game.scale.minHeight = Game.height / 2;
		 game.scale.maxWidth = Game.width * 2;
		 game.scale.maxHeight = Game.height * 2;
		 game.scale.pageAlignHorizontally = true;
		 game.scale.pageAlignVertically = true;
	 } else{
		 game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		 game.scale.minWidth = Game.width / 2;
		 game.scale.minHeight = Game.height / 2;
		 game.scale.maxWidth = Game.width * 2; //You can change this to gameWidth*2.5 if needed
		 game.scale.maxHeight = Game.height * 2; //Make sure these values are proportional to the gameWidth and gameHeight
		 game.scale.pageAlignHorizontally = true;
		 game.scale.pageAlignVertically = true;
		 game.scale.forceOrientation(true, false);

		 game.scale.enterIncorrectOrientation.add(PreGame.enterIncorrectOrientation, this);
		 game.scale.leaveIncorrectOrientation.add(PreGame.leaveIncorrectOrientation, this);
	}

};

PreGame.enterIncorrectOrientation = function(){
	if(!game.device.desktop){
 		document.getElementById("turn_tip").style.display="block";
 	}
}

PreGame.leaveIncorrectOrientation = function(){
	if(!game.device.desktop){
 		document.getElementById("turn_tip").style.display="none";
 	}
}

PreGame.isCorrectOrientation = function(){
	return game.device.desktop || game.scale.isLandscape;
}

PreGame.onLoginButton = function(){
	PreGame.resize();
	Game.localPlayerName = PreGame.inputUserName.text.text;
	console.log(Game.localPlayerName);
	game.state.start('Game');
}