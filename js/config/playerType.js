config.playerType = {
	// The default player
	default:{
		key : "default",
		spriteName : "red",
		anchorX : 0.5,
		anchorY : 0.5,

		// physics
		moveForceX : 10,
		moveForceY : -15,
		maxVelocityX : 220,
		maxVelocityY : 220,
		gravity : 200,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,
		
		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 30,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// battle
		maxLife : 80,
		bulletType : "default",
		attackFrame : 9,
		onhitFrame : 10,
	},

	// player type: baddie
	// fast but fragile
	red:{
		key : "red",
		spriteName : "red",
		anchorX : 0.5,
		anchorY : 0.5,

		// physics
		moveForceX : 10,
		moveForceY : -15,
		maxVelocityX : 220,
		maxVelocityY : 220,
		gravity : 200,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,
		
		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 30,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// battle
		maxLife : 80,
		bulletType : "default",
		attackFrame : 9,
		onhitFrame : 10,
	},
     






    yellow:{
		key : "yellow",
		spriteName : "yellow",
		anchorX : 0.5,
		anchorY : 0.5,
		
		// physics
		moveForceX : 5,
		moveForceY : -5,
		maxVelocityX : 120,
		maxVelocityY : 120,
		gravity : 100,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 30,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 45,
		hitBoxOfffsetY : 40,

		// battle
		maxLife : 60,
		bulletType : "default",
		attackFrame : 9,
		onhitFrame : 10,
	},
      





    blue:{
		key : "blue",
		spriteName : "blue",
		anchorX : 0.5,
		anchorY : 0.5,
		
		// physics
		moveForceX : 5,
		moveForceY : -5,
		maxVelocityX : 120,
		maxVelocityY : 120,
		gravity : 100,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 30,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// battle
		maxLife : 50,
		bulletType : "default",
		attackFrame : 9,
		onhitFrame : 10,
	},





	black:{
		key : "black",
		spriteName : "black",
		anchorX : 0.72,
		anchorY : 0.6,
		
		// physics
		moveForceX : 5,
		moveForceY : -5,
		maxVelocityX : 120,
		maxVelocityY : 120,
		gravity : 100,
		drag : 0,
		bounceX : 0.2,
		bounceY : 0.2,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 30,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 160,
		hitBoxOfffsetY : 40,
		
		// battle
		maxLife : 70,
		bulletType : "default",
		attackFrame : 9,
		onhitFrame : 10,
	},

}