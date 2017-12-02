var fs = require('fs');
var path = require('path');
var proc = require('process');

var folderRenameMap = {
	"待机":"idle",
	"地面移动":"move",
	"攻击":"attack0",
	"攻击2":"attack1",
	"攻击3":"attack2",
	"攻击4":"attack3",
	"受击1":"onhit0",
	"受击2":"onhit1",
	"空中移动1":"airmove0",
	"空中移动2":"airmove1",
};

var renameLeafFiles = function(folderPath){
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

			var filePath = path.join(folderPath, file);
			var toPath = path.join(folderPath, imageIndex.toString() + ".png");
			imageIndex++;

			fs.stat(filePath, function(error, stat){
				if(error){
					console.error("Error stating file", error);
					return;
				}

				if(stat.isFile()){

				}else if(stat.isDirectory()){
					return;
				}

				fs.rename(filePath, toPath, function(err){
					if(err)
						console.error("Error when renaming", err);
				});
			});
		});
	});
}


var renameSubfolers = function(folderPath){
	fs.readdir(folderPath, function(err, files){
		if(err){
			console.error("Could not list the directory", err);
			proc.exit(1);
		}

		files.forEach(function(file, index){
			var filePath = path.join(folderPath, file);
			if(!folderRenameMap[file]){
				console.error("folder map not found: " + file);
				return;
			}
			var toPath = path.join(folderPath, folderRenameMap[file]);

			fs.stat(filePath, function(error, stat){
				if(error){
					console.error("Error stating file", error);
					return;
				}

				if(stat.isFile()){
					return;
				}else if(stat.isDirectory()){
					
				}

				fs.rename(filePath, toPath, function(err){
					if(err){
					console.error("Error when renaming", err);
					}else{
						renameLeafFiles(toPath);
					}
				});
				
			});
		});
	});
}


// renameLeafFiles("./");
renameSubfolers("./");

