// Start the game
var game = new Phaser.Game(Game.width, Game.height, Phaser.CANVAS, document.getElementById('game'));
game.state.add('PreGame', PreGame);
game.state.add('Game', Game);
game.state.start('PreGame');
