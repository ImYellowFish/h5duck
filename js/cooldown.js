var Cooldown = {
	createNew: function(maxValueMS, initValueMS){
		var cooldown = {};
		cooldown.maxValue = maxValueMS;
		if(initValueMS == undefined)
			initValueMS = maxValueMS;
		cooldown.initValue = initValueMS;
		cooldown.value = initValueMS;

		cooldown.tick = function(){
			cooldown.value -= game.time.physicsElapsedMS;
		};

		cooldown.reset = function(){
			cooldown.value = cooldown.maxValue;
		}

		cooldown.busy = function(){
			return cooldown.value > 0;
		}

		cooldown.ready = function(){
			return cooldown.value <= 0;
		}
		
		return cooldown;
	}
}