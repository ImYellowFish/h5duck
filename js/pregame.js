var PreGame = {};

PreGame.preload = function() {
	game.load.atlasJSONHash('ui', 'assets/sprites/ui.png', 'assets/sprites/ui.json');
}

PreGame.create = function(){
	game.add.plugin(PhaserInput.Plugin);

	// resize the game
	PreGame.resize();

	PreGame.inputUserName = 
		game.add.inputField(550, 250, {
		    font: '24px Arial',
		    fill: '#212121',
		    fontWeight: 'bold',
		    width: 150,
		    padding: 8,
		    borderWidth: 1,
		    borderColor: '#000',
		    borderRadius: 6,
		    placeHolder: '昵称:',
		    type: PhaserInput.InputType.text,
		});
	
	PreGame.loginButton = game.add.button(660, 500, 'ui', PreGame.onLoginButton, this, 
		'hpBarBgPlayer.png', 'hpBarBgPlayer.png', 'hpBarBgPlayer.png', 'hpBarPlayer.png');
	PreGame.loginButton.anchor.setTo(0.5, 0.5);
	PreGame.loginButton.scale.setTo(0.5, 1);

	PreGame.loginButtonText = game.add.text(PreGame.loginButton.centerX, 
		PreGame.loginButton.centerY, "开始");
	PreGame.loginButtonText.anchor.setTo(0.5, 0.5);
	
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
		 game.scale.maxWidth = Game.width * 3;
		 game.scale.maxHeight = Game.height * 3;
		 game.scale.pageAlignHorizontally = true;
		 game.scale.pageAlignVertically = true;
	 } else{
		 game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		 game.scale.minWidth = Game.width / 2;
		 game.scale.minHeight = Game.height / 2;
		 game.scale.maxWidth = Game.width * 3; //You can change this to gameWidth*2.5 if needed
		 game.scale.maxHeight = Game.height * 3; //Make sure these values are proportional to the gameWidth and gameHeight
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
	Game.localPlayerName = PreGame.inputUserName.text.text;
	console.log(Game.localPlayerName);
	game.state.start('Game');
}