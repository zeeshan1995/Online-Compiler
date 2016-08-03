var express = require('express');
var app = express();
var server = require('http').Server(app);
var fs = require('fs');
var sys = require('util');
var exec = require('child_process').exec;
var io = require('socket.io')(server);
var uid = require('uid');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

var names=[];
var users={};
server.listen(8000,function(){console.log('Server is up.');});

app.get('/*',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
/*
        The error.code property will be the exit code of the child process 
        while error.signal will be set to the signal that terminated the process. 
        Any exit code other than 0 is considered to be an error.
    */
    
app.post("/compile", function(req, res) {
    
    var code = req.body.code, input = req.body.input, projectID = req.body.projectID;
    console.log(input);
    if(!input)
    console.log("null");
    var path="cache/" + projectID+"/";
        exec("mkdir "+path);
        fs.writeFile(__dirname+"/" +path+"main.cpp",code,function(err){
            fs.writeFile(__dirname+"/"+path+"input.txt",input,function(err){
                exec("g++ "+path+"main.cpp -o "+path+"main.run",function(error,stdout,stderr){
                    var msg="";
                    if(error!=null && error.code!='0')
                    {
                        msg="<b>***********COMPILATION ERROR***************<br></b>"+stderr+"<b>************************************</b>";
                        msg=replaceAll(msg,path,"");
                        msg=replaceAll(msg,'\n','<br>');
                        res.end(msg);
                    }
                    else{
                        if(stderr)
                            msg="<b>***********WARNING***************<br></b>"+stderr+"<b>************************************</b><br>";
                        if(!msg && !input)
                            res.send("<b>***********COMPILATION SUCCESS***************<br></b>");
                        else if(msg){
                            msg=replaceAll(msg,path,"");
                            msg=replaceAll(msg,'\n','<br>');
                            res.end(msg);
                        }
                        exec("execute "+path+"main.run main.run "+path+"input.txt",function(error,stdout,stderr){
                            /*
                            console.log("here");
                            console.log("error::" ,error,"\n******");
                            console.log("stdout::" ,stdout,"\n******");
                            console.log("stderr::" ,stderr,"\n******");
                            */
                            if(error)
                                msg+="<b>***********RUNTIME ERROR***************<br></b>"+error+"<b>************************************</b>";
                            if(stdout)
                                msg+="<b>***********OUTPUT***************<br></b>"+stdout+"</br><b>************************************</b>";
                            else if(!msg)
                                msg+="<b>***********COMPILATION SUCCESS***************<br></b>";
                            msg=replaceAll(msg,path,"");
                            msg=replaceAll(msg,'\n','<br>');
                            res.end(msg);
                        });      
                    }
                })
            });
        });
});

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var codes={};
io.on('connection',function(socket){
	console.log("Connected");
    if((socket.handshake.headers.referer=="http://192.168.1.6:8000/")||( socket.handshake.headers.referer=="http://localhost:8000/")){
        var projectid=uid();
        socket.projectID=projectid;
        socket.join(projectid);
        socket.emit('projectID',projectid);
    }
    else{
        var projectid=socket.handshake.headers.referer.split('/')[3];
        socket.projectID=projectid;
        socket.join(projectid);
        socket.emit('edited',codes[socket.projectID]);
    }
    
    socket.on('compile_msg',function(msg){
        io.in(socket.projectID).emit('compile_msg',msg);
    })
    socket.on('edited',function(code){
        codes[socket.projectID]=code;
        socket.broadcast.to(socket.projectID).emit('edited',code);//Send to all in the room except the sender.
    })



	socket.on('user',function(data){
				names.push(data);
				users[socket.id]=data;
	//			io.sockets.emit('names',names);
	});

	socket.on('chat message',function(message){
			if(message){
				io.in(socket.projectID).emit('chat message',users[socket.id]+" :: "+message);
				//console.log("Message Emitted from: " + users[socket.id]);
			}
		});

	socket.on('disconnect',function(){
		if( !(socket.id in users )) return;
		var tmp=users[socket.id];
		names.splice(names.indexOf(users[socket.id]),1);
		delete users[socket.id];
		socket.broadcast.to(socket.projectID).emit('out',tmp);
		socket.broadcast.to(socket.projectID).emit('names',names);
		});
});
