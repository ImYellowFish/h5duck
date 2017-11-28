// Configs the game
var config = {
// --------------------------------------------
// Debug
// --------------------------------------------
	debugPlayerBody : true,

	debugPlayerState : false,

// --------------------------------------------
// Game
// --------------------------------------------
	// reference game resolution width
	gameWidth : 1334,

	// reference game resolution height
    gameHeight : 750,

    // scaling of actual game resolution to the reference resolution
    // to get the actual size, use Game.width and Game.height
    gameWindowScale : 1,


// --------------------------------------------
// Player
// --------------------------------------------
	// init facing direction. 1 for facing right, -1 for facing left
	playerInitFacingDir : -1, 

	// respawn delay after death
	playerRespawnDelay : 3000,

	// the default scale for player sprites
	playerSpriteImportScale : 1,

	// the scale for displaying players
	playerSpriteScale : 2,

	// default player type
	playerDefaultType : "default",

	// animation framerate
	playerAnimationFramerate : 24,

	// default frame
	playerAnimationDefaultFrame : "idle/0.png",

	// player will be regarded as static if its speed is less than IdleMaxSpeed.
	playerIdleMaxSpeed : 5,

// --------------------------------------------
// Bullet
// --------------------------------------------
	// max bulletID for each player
	maxBulletID : 1000,

	// if a bullet cannot be synchronized for this length
	// the bullet will be removed
	bulletSyncTimeOut : 2000,

	// default bullet type
	bulletDefaultType : "default",

	// animation framerate
	bulletAnimationFramerate : 24,

	// default frame
	bulletAnimationDefaultFrame : "0.png",
};

