config.playerType = {
	red:{
		key : "red",
		spriteName : "red",
		anchorX : 0.5,
		anchorY : 0.5,

		// physics
		moveForceX : 7,
		moveForceY : -14,
		maxVelocityX : 100,
		maxVelocityY : 100,
		gravity : 300,
		drag : 0,
		bounceX : 0.7,
		bounceY : 0.7,
		
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
		maxLife : 120,
		bulletType : "shotgun",
		attackFrame : 9,
		onhitFrame : 10,
		shootCooldown: 3000,
		moveStepCooldown: 0,
	},
     






    yellow:{
		key : "yellow",
		spriteName : "yellow",
		anchorX : 0.5,
		anchorY : 0.5,
		
		// physics
		moveForceX : 10,
		moveForceY : -20,
		maxVelocityX : 120,
		maxVelocityY : 120,
		gravity : 300,
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
		shootCooldown: 1500,
		moveStepCooldown: 0,
	},
      





    blue:{
		key : "blue",
		spriteName : "blue",
		anchorX : 0.5,
		anchorY : 0.5,
		
		// physics
		moveForceX : 20,
		moveForceY : -40,
		maxVelocityX : 200,
		maxVelocityY : 200,
		gravity : 300,
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
		maxLife : 70,
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
		moveForceX : 15,
		moveForceY : -30,
		maxVelocityX : 160,
		maxVelocityY : 160,
		gravity : 300,
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
		maxLife : 90,
		bulletType : "fork",
		attackFrame : 9,
		onhitFrame : 10,
		shootCooldown: 3000,
		moveStepCooldown: 0,
	},

}