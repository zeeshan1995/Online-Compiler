
var fs = require('fs');
var execSync = require('child_process').execSync;
var spawnSync= require('child_process').spawnSync;
exports.write=function(path,code,input,ext){
	fs.writeFileSync(path + "main."+ ext,code);
	fs.writeFileSync(path+"input.txt",input)
};

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

function compile_info (spawn,path){
	var compile_info = {},msg="",warning_msg="",warning = false;;
	if(spawn.status==0){
		if(spawn.stderr.toString()){
			warning_msg="<b>***********WARNING***************<br></b>"+spawn.stderr.toString()+"</b><br><b>*********************************</b><br>";
			warning_msg=replaceAll(warning_msg,path,'');
			warning_msg=replaceAll(warning_msg,'\n','<br>');
		}
		msg="<b>***********COMPILATION SUCCESS***************<br></b>";
	}
	else
		msg="<b>***********COMPILATION ERROR***************<br></b>"+spawn.stderr.toString()+"</b><br><b>*******************************</b>";
	compile_info["warning_msg"] = warning_msg;
	
	msg=replaceAll(msg,path,'');
	msg=replaceAll(msg,'\n','<br>');
	
	compile_info['status'] = spawn.status;
	compile_info['msg'] = warning_msg + msg;
	return compile_info;
};
function run_info(spawn,path){
	var msg = '';
	if(spawn.stderr.toString())
		msg+="<b>***********RUNTIME ERROR***************<br></b>"+spawn.stderr.toString()+"<b>************************************</b>";
	if(spawn.stdout.toString())
		msg+="<b>***********OUTPUT***************<br></b>"+spawn.stdout.toString()+"</br><b>************************************</b>";
	else if(!msg)
		msg+="<b>***********COMPILATION SUCCESS***************<br></b>";
	msg = replaceAll(msg,path,'');
	return replaceAll(msg,'\n','<br>');
};
exports.makedir=function(path){
	execSync("mkdir "+path);
};

exports.compile=function(command, argArray, path){
	return compile_info(spawnSync(command,argArray),path);
};

exports.run=function(argArray,path){
	var spawn=spawnSync("./execute",argArray,{timeout : 3000});
	return run_info(spawn,path);
};
