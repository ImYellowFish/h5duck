var levelBuilder = {};
// --------------------------------------------
// API
// --------------------------------------------
levelBuilder.preload = function(){
	game.load.pack('level', 'assets/level/levelRes.json');
	game.load.json('levelLayout', 'assets/level/levelLayout.json');
	game.load.atlasJSONHash('zap', 'assets/level/zap.png', 'assets/level/zap.json');
};

levelBuilder.createLevel = function(){
	var level = {};
	level.groups = {};
	level.bgGroup = game.add.group();

	level.blockGroup = game.add.group();
	level.blockGroup.enableBody = true;

	level.zapGroup = game.add.group();
	level.zapGroup.enableBody = true;

	level.scale = config.levelScale;
	
	var layout = game.cache.getJSON('levelLayout');
	Object.keys(layout).forEach(function(key){
		var group = levelBuilder.buildGroup(layout[key], level);
		level.groups[key] = group;
	});

	return level;
}


// --------------------------------------------
// builders
// --------------------------------------------
levelBuilder.buildGroup = function(groupData, level){
	var group = { 
		level: level,
		elements: {},
	};

	Object.keys(groupData).forEach(function(key){
		var element = levelBuilder.buildElement(groupData[key], group);
		group.elements[key] = element;
	});
}

levelBuilder.buildElement = function(elementData, group){
	var element = {};	
	element.name = elementData.name;
	element.groupIndex = elementData.group;
	element.group = group;
	element.key = elementData.key;
	element.spriteKey = elementData.key;
	
	var rule = levelBuilder.rules[element.key];
	if(rule && rule.keyOverride){
		element.spriteKey = rule.keyOverride;
	}

	var scale = 1;
	if(rule && rule.scale)
		scale = rule.scale;

	element.sprite = game.add.sprite(
		elementData.x, 
		elementData.y, 
		element.spriteKey, 
		rule.frame);	
	element.sprite.scale.setTo(elementData.scaleX * scale, elementData.scaleY * scale);

	var postProcess = rule.post;
	if(postProcess){
		postProcess(element);
	}
}


// --------------------------------------------
// post-processing
// --------------------------------------------
levelBuilder.setupBlockElement = function(element){
	element.group.level.blockGroup.add(element.sprite);
	element.sprite.body.immovable = true;
}

levelBuilder.setupZapElement = function(element){
	element.group.level.zapGroup.add(element.sprite);
	element.sprite.animations.add('idle', ["zap0.png", "zap1.png", "zap2.png"], 12, true, false);
	element.sprite.animations.play('idle');
}

levelBuilder.setupBgElement = function(element){
	element.group.level.bgGroup.add(element.sprite);
}


// --------------------------------------------
// rules
// --------------------------------------------
levelBuilder.rules = {
	'duckbg' : {post: levelBuilder.setupBgElement, scale: 4},

	'block0': {post: levelBuilder.setupBlockElement},

	'block1': {post: levelBuilder.setupBlockElement},

	'block2': {post: levelBuilder.setupBlockElement},

	'zapblock': {post: levelBuilder.setupBlockElement},
	
	'zap0': {keyOverride: 'zap', frame: 'zap0.png', post: levelBuilder.setupZapElement},

	'zap1': {keyOverride: 'zap', frame: 'zap0.png', post: levelBuilder.setupZapElement},

	'zap2': {keyOverride: 'zap', frame: 'zap0.png', post: levelBuilder.setupZapElement},
}

