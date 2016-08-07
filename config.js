



exports.PATH=function(projectID){
	return config.path + projectID + '/';	
};

var config=
{
	path: __dirname+'/' + 'cache/',
	port : 8000
};

exports.PORT=config.port;
