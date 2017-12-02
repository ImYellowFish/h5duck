config.playerType = {
	red:{
		key : "red",
		spriteName : "red",
		anchorX : 0.5,
		anchorY : 0.5,

		// physics
		moveForceX : 30,
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
		
		// shoot position
		gunOffsetX : 45,
		gunOffsetY : -10,

		// battle
		maxLife : 80,
		bulletType : "shotgun",
		attackFrame : 9,
		onhitFrame : 10,
		shootCooldown: 1000,
		moveStepCooldown: 0,
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
		bounceX : 0.5,
		bounceY : 0.5,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 30,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 45,
		hitBoxOfffsetY : 40,

		// shoot position
		gunOffsetX : 10,
		gunOffsetY : -50,

		// battle
		maxLife : 100,
		bulletType : "missile",
		attackFrame : 9,
		onhitFrame : 10,
		shootCooldown: 1000,
		moveStepCooldown: 0,
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

		// shoot position
		gunOffsetX : 35,
		gunOffsetY : -10,

		// battle
		maxLife : 50,
		bulletType : "shuriken",
		attackFrame : 9,
		onhitFrame : 10,
		shootCooldown: 1000,
		moveStepCooldown: 0,
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
		
		// shoot position
		gunOffsetX : 70,
		gunOffsetY : -30,

		// battle
		maxLife : 70,
		bulletType : "fork",
		attackFrame : 9,
		onhitFrame : 10,
		shootCooldown: 1000,
		moveStepCooldown: 0,
	},

}