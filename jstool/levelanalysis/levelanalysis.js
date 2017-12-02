var fs = require('fs');
var fileName = "level.txt";
var groupDist2 = 50000;
var y_multiplier = 100;
var groupIter = 5;
var nextGroupIndex = 0;
	
filterAdd = function(leveltext){
	var regex = new RegExp("var .* = game.add.sprite\\(.*, .*, \\'.*\\'","g");

	// const regex = /game/g;
	var results = leveltext.match(regex);	
	results.input = null;
	return results;
}

filterAddScale = function(leveltext){
	var regex = new RegExp("_.*\\.scale\\.setTo\\(.*, .*\\);","g");

	// const regex = /game/g;
	var results = leveltext.match(regex);	
	return results;
}

filterScale = function(scaleLine){
	var regex = new RegExp("(_.*)\\.scale\\.setTo\\((.*), (.*)\\);","g");

	// const regex = /game/g;
	var results = regex.exec(scaleLine);	
	var spriteScale = {};
	spriteScale.name = results[1];
	spriteScale.scaleX = parseFloat(results[2]);
	spriteScale.scaleY = parseFloat(results[3]);
	return spriteScale;
}


filterCoords = function(addline, lineIndex){
	var regex = new RegExp("var (.*) = game.add.sprite\\((.*), (.*), \\'(.*)\\'");
	var result = regex.exec(addline);
	var sprite = {};
	sprite.name = result[1];
	sprite.x = parseInt(result[2]);
	sprite.y = parseInt(result[3]);
	sprite.key = result[4];
	return sprite;
}

filterUngroupedLevel = function(addedLines, scalelines){
	var levelRaw = {}
	for(var i = 0; i < addedLines.length; i++){
		var sprite = filterCoords(addedLines[i], i);
		console.log(sprite.name);
		levelRaw[sprite.name] = sprite;
	}
	console.log('\n\n\n');

	for(var i = 0; i < scalelines.length; i++){
		var spriteScale = filterScale(scalelines[i]);
		console.log(spriteScale.name);
		var sprite = levelRaw[spriteScale.name];
		sprite.scaleX = spriteScale.scaleX;
		sprite.scaleY = spriteScale.scaleY;
	}

	return levelRaw;
}

filterGroup = function(ungrouped){
	var keys = Object.keys(ungrouped);
	for(var iter = 0; iter < groupIter; iter++){
		for(var i = 0; i < keys.length; i++){
			var spriteName = keys[i];
			var s1 = ungrouped[spriteName];
			
			for(var j = 0; j < keys.length; j++){
				var s2 = ungrouped[keys[j]];
				if(i != j && getDist2(s1, s2) <= groupDist2){
					groupSprites(s1, s2, ungrouped);
				}
			}

			if(!s1.group){
				s1.group = nextGroupIndex++;
			}
		}
	}

	var grouped = {};
	// build grouped
	for(var i = 0; i < keys.length; i++){
		var spriteName = keys[i];
		var s = ungrouped[spriteName];
		if(!grouped[s.group])
			grouped[s.group] = {};
		grouped[s.group][spriteName] = s;
	}

	return grouped;
}


getDist2 = function(s1, s2){
	return (s1.x - s2.x) * (s1.x - s2.x) + 
		(s1.y - s2.y) * (s1.y - s2.y) * y_multiplier;
}

groupSprites = function(s1, s2, ungrouped){
	if(s1.group && !s2.group){
		s2.group = s1.group;
	}else if(!s1.group && s2.group){
		s1.group = s2.group;
	}else if(s1.group && s2.group){
		if(s1.group != s2.group){
			mergeGroup(s1.group, s2.group, ungrouped);
		}
	}else{
		s1.group = nextGroupIndex;
		s2.group = nextGroupIndex;
		nextGroupIndex++;					
	}
}

mergeGroup = function(g1, g2, ungrouped){
	var newGroup = Math.min(g1, g2);
	Object.keys(ungrouped).forEach(function(key){
		var s3 = ungrouped[key].group;
		if(s3.group == g1 || s3.group == g2){
			s3.group = newGroup;
		}
	});
}


var text = fs.readFileSync(fileName, 'utf8');

var addedLines = filterAdd(text);
var scaleLines = filterAddScale(text);
var ungrouped = filterUngroupedLevel(addedLines, scaleLines);
var grouped = filterGroup(ungrouped);

var outputText = JSON.stringify(grouped, null, "\t");
fs.writeFile('level.json', outputText, 'utf8', function(err){
			if(err){
				console.err("error when writing anim json", err);
			}else{
				console.log("job complete.");
			}
		});