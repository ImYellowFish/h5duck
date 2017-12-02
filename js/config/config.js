// Configs the game
var config = {
// --------------------------------------------
// Debug
// --------------------------------------------
	// main control
	debug : true,

	debugFPS : true,

	debugPlayerBody : false,

	debugPlayerState : true,

	debugPlayerUnlimitedHP : false,
	
	debugLevelBlockBody : false,

	debugBulletBody : false,

	// values: null, 'black', 'red', 'yellow', 'blue'.
	debugPlayerType : null,

	debugEffectPool : true,

	debugBulletPool : true,

	debugProfile : true,

// --------------------------------------------
// Game
// --------------------------------------------
	// reference game resolution width
	gameWidth : 1334,

	// reference game resolution height
    gameHeight : 750,

    // reference game world height
    gameWorldWidth : 3000,

	// reference game world width
    gameWorldHeight : 2000,


    // scaling of actual game resolution to the reference resolution
    // to get the actual size, use Game.width and Game.height
    gameWindowScale : 1,

    cameraFollowLerpX : 0.5,

    cameraFollowLerpY : 0.5,

    cameraDeadScreenAlpha : 0.6,
// --------------------------------------------
// Player
// --------------------------------------------
	// init facing direction. 1 for facing right, -1 for facing left
	playerInitFacingDir : -1, 

	// respawn delay after death (ms)
	playerRespawnDelay : 3000,

	// invincible time after respawn (ms)
	playerRespawnProtection : 1000,

	playerRespawnProtectionRepeat : 2,

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
	playerIdleMaxSpeed : 10,

	// Invunlerable frames from zap after being zapped. (ms)
	playerZapProtection : 2100,

	// player total disable duration after being zapped. (ms)
	playerZapDuration : 2000,

	// player static duration after being zapped. (ms)
	playerZapLockDuration : 1000,

	defaultPlayerType : "yellow",

// --------------------------------------------
// Bullet
// --------------------------------------------
	// max bulletID for each player
	maxBulletID : 1000,

	// if a bullet cannot be synchronized for this length (ms)
	// the bullet will be removed
	bulletSyncTimeOut : 2000,

	// default bullet type
	bulletDefaultType : "default",

	// animation framerate
	bulletAnimationFramerate : 24,

	// default frame
	bulletAnimationDefaultFrame : "0.png",

	defaultBulletType : "missile",

	bulletFriendlyFireProtection : 500,
// --------------------------------------------
// UI
// --------------------------------------------
	uiButtonScale : 0.4,
	uiLifeBarScale : 0.4,
	uiLifeBarOffsetX : 0,
	uiLifeBarOffsetY : -80,
	uiLifeBarPlayerSpeed : 4 / 60,
	uiLifeBarPlayerMgSpeed : 2 / 60,
	uiLifeBarEnemySpeed : 4 / 60,
	uiNameTextOffsetY : -80,
};

