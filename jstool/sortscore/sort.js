var scoreCompareFunction = function(a, b){
	return b - a;
}

var players = [3, 5, 21, 6, 0, 0, 1, 3, 5];
var getRank = function(){
	var scoreBucket = {};

	for(var i = 0; i < players.length; i++){
		var score = players[i];
		if(!scoreBucket[score]){
			scoreBucket[score] = 0;
		}
		scoreBucket[score]++;
	}

	var scores = Object.keys(scoreBucket);
	scores.sort(scoreCompareFunction);

	var rank = 1;
	var scoreToRank = {};
	for(var i = 0; i < scores.length; i++){
		var s = scores[i];
		scoreToRank[s] = rank;
		rank += scoreBucket[s];
	}
	scoreToRank.leader = scores[0];
	
	return scoreToRank;
}

console.log(getRank());