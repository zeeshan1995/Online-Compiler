
var config=require('../config.js');
var utils=require('../utility/utils.js');

exports.compile=function(projectID,code,input){
	var path=config.PATH(projectID);
	utils.write(path,code,input,"cpp");
	return utils.compile("g++", [path+ "main.cpp", "-o",path+"main.run"], path);
};

exports.run=function(projectID){
	var path=config.PATH(projectID);
	return utils.run([path +"main.run",path + "main.run ",path + "input.txt"],path);
};
