// Configs the game
var config = {
// --------------------------------------------
// Game
// --------------------------------------------
	gameWidth : 800,
    gameHeight : 480,
    gameWindowScale : 1,

// --------------------------------------------
// Player
// --------------------------------------------
	// init facing direction. 1 for facing right, -1 for facing left
	playerInitFacingDir : 1, 

	// physics
	playerMoveForceX : 5,
	playerMoveForceY : -5,
	playerMaxVelocityX : 120,
	playerMaxVelocityY : 120,
	playerGravity : 100,
	playerDrag : 0,
	playerBounceX : 0.2,
	playerBounceY : 0.2,

	// battle
	playerMaxLife : 100,
	playerRespawnDelay : 3000,

// --------------------------------------------
// Bullet
// --------------------------------------------
	maxBulletID : 1000,
	bulletSyncTimeOut : 2000,
	bulletDamage : 40,
};

