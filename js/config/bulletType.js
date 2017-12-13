// onHitType config
config.onHitType = {
	default: {
		key: "default",
		effect: "blasthit",
		force: 0,
		sound: "yellowHit",
	},

	blasthit: {
		key: "blasthit",
		effect: "blasthit",
		force: 0,
		sound: "yellowHit",
	},

	forkhit: {
		key: "forkhit",
		effect: "forkhit",
		force: 50,
		sound: "blackHit",
	},

	bladehit: {
		key: "bladehit",
		effect: "bladehit",
		force: 0,
		sound: "blueHit",
	},

	shotgunhit: {
		key: "shotgunhit",
		effect: "blasthit",
		force: 400,
		sound: "redHit",
	},

	zaphit: {
		key: "zaphit",
		handledByFsm: true,
		sound: "zap",
	},
};


// bulletType config
config.bulletType = {
	// yellow
	missile : {
		key : "missile",
		
		// sprite
		spriteName : "missile",
		angle: 0,
		direction: -1,
		anchorX : 0.6,
		anchorY : 0.5,
		scale : 1,
		length: 6,
		loop: true,

		// battle
		damage : 25,
		penetrate : false,
		duration : 4000,
		recoil : 50,

		// physics
		velocityX : 600,
		velocityY : -400,
		gravity : 1200,
		drag : 0,
		bounce : 0.3,
		collideWithBlocks : true,

		splitWhenCollideBlocks : true,
		splitSpawns : ["miniMissileA", "miniMissileB"],

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 65,
		hitBoxHeight : 32,
		hitBoxOfffsetX : 52,
		hitBoxOfffsetY : 35,

		// effect
		onHitType: "blasthit",
		firesound: "yellowAttack",
	},




	// red
	shotgun : {
		key : "shotgun",
		
		// sprite
		spriteName : "shotgun",
		angle: 0,
		direction: -1,
		anchorX : 0.85,
		anchorY : 0.5,
		scale : 1,
		length: 9,
		loop: false,

		// battle
		damage : 30,
		penetrate : true,
		duration : 300,
		recoil : 100,

		// physics
		velocityX : 0,
		velocityY : 0,
		followPlayer : true,
		gravity : 0,
		drag : 0,
		bounce : 0,
		collideWithBlocks : false,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 180,
		hitBoxHeight : 150,
		hitBoxOfffsetX : 120,
		hitBoxOfffsetY : 80,

		// effect
		onHitType: "shotgunhit",
		firesound: "redAttack",
	},




	// blue
	shuriken : {
		key : "shuriken",

		// sprite
		spriteName : "shuriken",
		angle: 0,
		direction: -1,
		anchorX : 0.5,
		anchorY : 0.5,
		scale : 1,
		length: 17,
		loop: true,

		// battle
		damage : 15,
		penetrate : true,
		duration : 5000,
		friendlyFire : true,
		recoil : 25,

		// physics
		velocityX : 600,
		velocityY : 0,
		gravity : 10,
		drag : 0,
		bounce : 0.6,
		bounceRandomY : 200,
		collideWithBlocks : true,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 60,
		hitBoxHeight : 60,
		hitBoxOfffsetX : 20,
		hitBoxOfffsetY : 20,

		// effect
		onHitType: "bladehit",
		firesound: "blueAttack",
	},







	fork : {
		key : "fork",

		// sprite
		spriteName : "fork",
		angle: 0,
		direction: -1,
		anchorX : 0.5,
		anchorY : 0.5,
		scale : 1,
		length: 3,
		loop: true,

		// battle
		damage : 10,
		penetrate : true,
		duration : 150,
		recoil : 50,

		// physics
		velocityX : 700,
		velocityY : 0,
		gravity : 0,
		drag : 0,
		bounce : 0.2,
		collideWithBlocks : false,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 200,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 50,
		hitBoxOfffsetY : 25,

		// effect
		onHitType: "forkhit",
		firesound: "blackAttack",
	},


	// miniMissile spawned from yellow missile
	miniMissileA : {
		key : "miniMissileA",
		
		// sprite
		spriteName : "missile",
		angle: 0,
		direction: -1,
		anchorX : 0.6,
		anchorY : 0.5,
		scale : 0.6,
		length: 6,
		loop: true,

		// battle
		damage : 5,
		penetrate : false,
		duration : 2000,
		friendlyFire : true,
		recoil : 0,

		// physics
		velocityX : 150,
		velocityY : -200,
		gravity : 0,
		drag : 0,
		bounce : 0.1,
		collideWithBlocks : true,
		
		splitWhenCollideBlocks : true,
		splitSpawns : ["miminiMissileA", "miminiMissileB"],

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 80,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// effect
		onHitType: "blasthit",
	},



	// miniMissile spawned from yellow missile
	miniMissileB : {
		key : "miniMissileB",
		
		// sprite
		spriteName : "missile",
		angle: 0,
		direction: -1,
		anchorX : 0.6,
		anchorY : 0.5,
		scale : 0.6,
		length: 6,
		loop: true,

		// battle
		damage : 5,
		penetrate : false,
		duration : 2000,
		friendlyFire : true,
		recoil : 0,

		// physics
		velocityX : 150,
		velocityY : 100,
		gravity : 0,
		drag : 0,
		bounce : 0.1,
		collideWithBlocks : true,
		splitWhenCollideBlocks : true,
		splitSpawns : ["miminiMissileA", "miminiMissileB"],


		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 80,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// effect
		onHitType: "blasthit",
	},


	// miniMissile spawned from yellow missile
	miminiMissileA : {
		key : "miminiMissileA",
		
		// sprite
		spriteName : "missile",
		angle: 0,
		direction: -1,
		anchorX : 0.6,
		anchorY : 0.5,
		scale : 0.4,
		length: 6,
		loop: true,

		// battle
		damage : 1,
		penetrate : false,
		duration : 800,
		friendlyFire : true,
		recoil : 0,

		// physics
		velocityX : 200,
		velocityY : -100,
		gravity : 0,
		drag : 0,
		bounce : 0.1,
		collideWithBlocks : true,
		destroyWhenCollideBlocks : true,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 80,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// effect
		onHitType: "blasthit",
	},


	// miniMissile spawned from yellow missile
	miminiMissileB : {
		key : "miminiMissileB",
		
		// sprite
		spriteName : "missile",
		angle: 0,
		direction: -1,
		anchorX : 0.6,
		anchorY : 0.5,
		scale : 0.4,
		length: 6,
		loop: true,

		// battle
		damage : 1,
		penetrate : false,
		duration : 800,
		friendlyFire : true,
		recoil : 0,

		// physics
		velocityX : 200,
		velocityY : 100,
		gravity : 0,
		drag : 0,
		bounce : 0.1,
		collideWithBlocks : true,
		destroyWhenCollideBlocks : true,

		// hitBox
		useCustomHitBox : true,
		hitBoxWidth : 80,
		hitBoxHeight : 40,
		hitBoxOfffsetX : 60,
		hitBoxOfffsetY : 30,

		// effect
		onHitType: "blasthit",
	},
}