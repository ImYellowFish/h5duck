var fs = require('fs');
var path = require('path');
var proc = require('process');


var getAnimLength = function(folderPath, onGetLength){
	fs.readdir(folderPath, function(err, files){
		if(err){
			console.error("Could not list the directory for ", err);
			proc.exit(1);
		}

		var imageIndex = 0;
		files.forEach(function(file, index){
			if(!file.includes("png")){
				return;
			}
			imageIndex++;
		});
		
		onGetLength(imageIndex);
	});
}


var getAnimNames = function(folderPath, onGetAnims){
	fs.readdir(folderPath, function(err, files){
		if(err){
			console.error("Could not list the directory", err);
			proc.exit(1);
		}

		var anims = {};
		var itemProcessed = 0;
		files.forEach(function(file, index, array){
			var animFolderPath = path.join(folderPath, file);			
			fs.stat(animFolderPath, function(error, stat){
				if(error){
					console.error("Error stating file", error);
					return;
				}

				if(stat.isFile()){
					itemProcessed++;
					return;
				}else if(stat.isDirectory()){
					
				}

				var anim = {
					name : file,
				};

				getAnimLength(animFolderPath, function(length){
					anim.length = length;
					anims[anim.name] = anim;
					itemProcessed++;

					// if all jobs done, invoke callback
					if(itemProcessed == array.length){
						onGetAnims(anims);
					}
				});
			});
		});
	});
}

var generateAnimFiles = function(){
	getAnimNames("./", function(anim){
		console.log(anim);
		var json = JSON.stringify(anim, null, "\t");
		fs.writeFile('anim.json', json, 'utf8', function(err){
			if(err){
				console.err("error when writing anim json", err);
			}else{
				console.log("job complete.");
			}

		});
	});
};

// getAnimLength("./", function(length){console.log(length);});
// getAnimNames("./", function(anim){console.log(anim);});
generateAnimFiles();
