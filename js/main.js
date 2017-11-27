// Start the game
var game = new Phaser.Game(Game.width, Game.height, Phaser.AUTO, document.getElementById('game'));
game.state.add('PreGame', PreGame);
game.state.add('Game', Game);
game.state.start('PreGame');
