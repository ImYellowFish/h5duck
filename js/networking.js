// Network utility
var networking = {};

networking.networkFPS = 20;
networking.updateInterval = 60 / networking.networkFPS;
networking.updaters = [];
networking.interpolateInterval = 1200 / networking.networkFPS;

networking.heartbeatTimer = 0;
networking.heartbeatInterval = 60;

networking.create = function(){
	networking.updateTimer = 0;
}

networking.update = function(){
	if(!Game.ready){
		return;
	}

	networking.updateTimer++;
	if(networking.updateTimer > networking.updateInterval){
		var arrayLength = networking.updaters.length;
		for(var i = 0; i < arrayLength; i++){
			networking.updaters[i]();
		}

		networking.updateTimer = 0;
	}

	// networking.heartbeatTimer++;
	// if(networking.heartbeatTimer > networking.heartbeatInterval){
	// 	Client.sendHeartBeat();
	// 	networking.heartbeatTimer = 0;
	// }
}

networking.registerUpdate = function(callback){
	networking.updaters.push(callback);
}

networking.removeUpdate = function(callback){
	var index = networking.updaters.indexOf(callback);
	if(index >= 0){
		networking.updaters.splice(index, 1);
	}
}

networking.interpolateFloat = function(f_new, t_new, f_old, t_old){
	var dt = Date.now() - t_new;
	var interPercent = dt / networking.interpolateInterval;

	var f = f_old + (f_new - f_old) * interPercent;
	return f;
}

// SpritePosSynchronizer
// helper class to synchronzie sprite position
networking.SpritePosSynchronizer = {
	createNew : function(sprite){
		var sync = {};
		sync.sprite = sprite;
		
		sync.setSprite = function(sprite){
			sync.sprite = sprite;
		}

		sync.reset = function(x, y){
			var initPosInfo = {x:x, y:y, time:Date.now()};
			sync.serverUpdates = [initPosInfo, initPosInfo];
		}

		sync.timeSinceLastUpdate = function(){
			return Date.now() - sync.serverUpdates[0].time;
		};

		sync.onSyncDataReceived = function(x, y){
			var newUpdateData = {x: x, y: y, time:Date.now()};
			// update old data
			sync.serverUpdates[1] = sync.serverUpdates[0];

			// update new data
			sync.serverUpdates[0] = newUpdateData;

			// console.log("sync: x=" + x + ", y=" + y);
		};

		sync.onUpdate = function(){
			sync.sprite.x = 
					networking.interpolateFloat(
						sync.serverUpdates[0].x, 
						sync.serverUpdates[0].time,
						sync.serverUpdates[1].x,
						sync.serverUpdates[1].time);
			sync.sprite.y = 
				networking.interpolateFloat(
					sync.serverUpdates[0].y, 
					sync.serverUpdates[0].time,
					sync.serverUpdates[1].y,
					sync.serverUpdates[1].time);	
		};

		// reset sync data
		sync.reset(sprite.x, sprite.y);
		return sync;
	}
}