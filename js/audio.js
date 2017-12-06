var audio = {
	preload: function(){
		game.load.audio('redAttack',"assets/audio/red_attack.wav");
		game.load.audio('redHit',"assets/audio/red_gethit.wav");
		game.load.audio('blueAttack',"assets/audio/blue_attack.wav");
		game.load.audio('blueHit',"assets/audio/blue_gethit.wav");
		game.load.audio('yellowAttack',"assets/audio/yellow_attack.wav");
		game.load.audio('yellowHit',"assets/audio/yellow_gethit.wav");
		game.load.audio('blackAttack',"assets/audio/black_attack.wav");
		game.load.audio('blackHit',"assets/audio/black_gethit.wav");
		game.load.audio('quack',"assets/audio/duck_gethit.wav");
		game.load.audio('zap',"assets/audio/zap.wav");
	},

	create: function(){
		audio.sfx = {};
		audio.createAudio('redAttack');
		audio.createAudio('redHit');
		audio.createAudio('blueAttack');
		audio.createAudio('blueHit');
		audio.createAudio('yellowAttack');
		audio.createAudio('yellowHit');
		audio.createAudio('blackAttack');
		audio.createAudio('blackHit');
		audio.createAudio('quack');
		audio.createAudio('zap');
	},

	createAudio: function(key){
		audio.sfx[key] = game.add.audio(key);
	},

	play: function(soundName){
		if(soundName)
			audio.sfx[soundName].play("", 0, config.gameAudioVolume, false, true);
	},

	test: function(){
		// audio.play('redAttack');
		// audio.play('redHit');
		// audio.play('blueAttack');
		// audio.play('blueHit');
		// audio.play('yellowAttack');
		// audio.play('yellowHit');
		// audio.play('blackAttack');
		// audio.play('blackHit');
		// audio.play('quack');
	},
}