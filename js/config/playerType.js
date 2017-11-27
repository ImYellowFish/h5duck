config.playerType = {
	// The default player
	default:{
		key : "default",
		spriteName : "default_player",

		// physics
		moveForceX : 5,
		moveForceY : -5,
		maxVelocityX : 120,
		maxVelocityY : 120,
		gravity : 100,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,

		// battle
		maxLife : 100,
		bulletType : "default",
	},

	// player type: baddie
	// fast but fragile
	baddie:{
		key : "baddie",
		spriteName : "baddie",

		// physics
		moveForceX : 10,
		moveForceY : -15,
		maxVelocityX : 220,
		maxVelocityY : 220,
		gravity : 200,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,

		// battle
		maxLife : 50,
		bulletType : "default",
	},
}