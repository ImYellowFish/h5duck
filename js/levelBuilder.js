var levelBuilder = {};
// --------------------------------------------
// API
// --------------------------------------------
levelBuilder.preload = function(){
	game.load.image('levelBg', 'assets/level/duckbg.png');
	game.load.json('levelLayout', 'assets/level/levelLayout.json');
	game.load.atlasJSONHash('level', 'assets/level/level.png', 'assets/level/level.json');
};

levelBuilder.createLevel = function(){
	var level = {};
	level.groups = {};
	level.bgGroup = game.add.group();

	level.blockGroup = game.add.group();
	level.blockGroup.enableBody = true;

	level.zapGroup = game.add.group();
	level.zapGroup.enableBody = true;

	level.jellyGroup = game.add.group();
	level.jellyGroup.enableBody = true;

	level.waterGroup = game.add.group();
	level.waterGroup.enableBody = true;

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
	if(!rule){
		console.error("error when loading", element.key, ",data: ", elementData);
		return;
	}
	
	element.spriteKey = 'level';
	element.frame = elementData.key + ".png";

	if(rule && rule.keyOverride){
		element.spriteKey = rule.keyOverride;
		element.frame = rule.frame;
	}

	var scale = 1;
	if(rule && rule.scale)
		scale = rule.scale;

	element.sprite = game.add.sprite(
		elementData.x, 
		elementData.y, 
		element.spriteKey, 
		element.frame);	
	element.sprite.scale.setTo(elementData.scaleX * scale, elementData.scaleY * scale);
	
	if(elementData.angle)
		element.sprite.angle = elementData.angle;

	var postProcess = rule.post;
	if(postProcess){
		postProcess(element);
	}

	// console.log("item: ", elementData.name, elementData.key, "scale: ", element.sprite.scale);
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

	if(Math.abs(element.sprite.angle) > 10){
		// hack code to fix horizontal zap
		element.sprite.body.setSize(80, 180, -75, 30);
	}
}

levelBuilder.setupBgElement = function(element){
	element.group.level.bgGroup.add(element.sprite);
}

levelBuilder.setupJellyElement = function(element){
	element.group.level.jellyGroup.add(element.sprite);
	element.sprite.body.immovable = true;
	if(Math.abs(element.sprite.angle) > 10){
		// hack code to fix horizontal zap
		element.sprite.body.setSize(100, 220, -95, 20);
	}
	element.sprite.animations.add('jelly', ["jelly0.png", "jelly1.png", "jelly2.png", "jelly0.png"], 12, false, false);	
}

levelBuilder.setupWaterElement = function(element){
	element.group.level.waterGroup.add(element.sprite);	
}

// --------------------------------------------
// rules
// --------------------------------------------
levelBuilder.rules = {
	'duckbg' : {keyOverride: 'levelBg', frame: null, post: levelBuilder.setupBgElement, scale: 4},

	'block0': {post: levelBuilder.setupBlockElement},

	'block1': {post: levelBuilder.setupBlockElement},

	'block2': {post: levelBuilder.setupBlockElement},

	'zapblock': {post: levelBuilder.setupBlockElement},
	
	'zap0': {post: levelBuilder.setupZapElement},

	'zap1': {post: levelBuilder.setupZapElement},

	'zap2': {post: levelBuilder.setupZapElement},

	'jelly0' : {post: levelBuilder.setupJellyElement},

	'jelly1' : {post: levelBuilder.setupJellyElement},

	'jelly2' : {post: levelBuilder.setupJellyElement},

	'water' : {scale: 2, post: levelBuilder.setupWaterElement},
}

