var config=require('../config');
var utils=require('../utility/utils');

exports.run=function(projectID,code,input){
	var path=config.PATH(projectID);
	utils.write(path,code,input,"py");
	return utils.run(['/usr/bin/python','python', path +"main.py",path +"input.txt"],path);
};
