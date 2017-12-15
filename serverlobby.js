lobby = {};
lobby.rooms = {};
lobby.roomCapacity = 10;
lobby.currentRoomIndex = -1;

// returns the first room that is not null or empty,
// otherwise create a new room.
lobby.getQuickRoom = function(){
	var key = lobby.searchAvailableQuickRoomKey();
	var room;
	if(key){
		room = lobby.rooms[key];
	}else{
		key = lobby.getNewRoomKey();
		room = lobby.createNew(key);
	}
	return room;
}

lobby.createNew = function(key){
	var room = {};
	room.key = key;
	room.sockets = {};
	room.size = 0;
	room.startTime = Date.now();

	// TODO: socket.io room

	room.addSocket = function(id, socket){
		room.sockets[id] = socket;
		socket.join(room.key);
		socket.room = room.key;
		room.size++;
		room.checkTimer();
	};

	room.removeSocket = function(id, socket){
		delete room.sockets[id];
		socket.leave(room.key);
		socket.room = null;
		room.size--;
		room.checkTimer();
	}

	room.getSocketsCount = function(){
		return Object.keys(room.sockets).length;
	}

	room.isFull = function(){
		return room.size >= lobby.roomCapacity;
	}

	// reset room timer if there are too few players
	room.checkTimer = function(){
		if(room.size < 2)
			room.startTime = Date.now();
	}

	lobby.rooms[key] = room;
	return room;
}

lobby.removeRoom = function(key){
	delete lobby.rooms[key];
}

lobby.getNewRoomKey = function(){
	lobby.currentRoomIndex++;
	return "room_" + lobby.currentRoomIndex;
}

lobby.searchAvailableQuickRoomKey = function(){
	var keys = Object.keys(lobby.rooms);
	for(var i = 0; i < keys.length; i++){
		var key = keys[i];
		var room = lobby.rooms[key];
		if(room && !room.isFull()){
			return key;
		}
	}
	return null;
}

module.exports = lobby;