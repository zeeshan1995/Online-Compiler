var express=require('express');
var app=express();
var server=require('http').Server(app);
var fs=require('fs');
var sys=require('util');
var exec=require('child_process').exec;
var io=require('socket.io')(server);
var uid=require('uid');

var names=[];
var users={};
server.listen(8000,function(){console.log('Server is up.');});

app.get('/*',function(req,res){
    res.sendFile(__dirname + '/index.html');
})

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var codes={};
io.on('connection',function(socket){
    
    if((socket.handshake.headers.referer=="http://192.168.1.6:8000/")||( socket.handshake.headers.referer=="http://localhost:8000/")){
        var room=uid();
        socket.room=room;
        socket.join(room);
        socket.emit('room_name',room);
    }
    else{
        var room=socket.handshake.headers.referer.split('/')[3];
        socket.room=room;
        socket.join(room);
        socket.emit('edited',codes[socket.room]);
    }
    
    socket.on('compile',function(code,input){
        fs.writeFile(__dirname+"/codes/" + socket.room + ".cpp",code,function(err){
            if(err)
                return console.log("Could not write");
            else{
                fs.writeFile(__dirname+"/codes/" + socket.room + ".txt",input,function(err){
                    if(err)
                        return console.log("Could not write");
                    else{
                        exec("cd codes/ && make file="+socket.room,function(error,stdout,stderr){
                            var msg;
                            if(stderr)
                              msg=stderr;
                            else if(stdout)
                              msg=stdout;
                            else
                                msg="Compilation Successfull."
                       //     console.log(stdout);
                            //console.log(msg);
                            msg=replaceAll(msg,'\n','<br>');
                            msg=replaceAll(msg,"codes",'');
                            msg=replaceAll(msg,socket.room,'code');
                            io.in(socket.room).emit('compile_msg',msg);
                        });   
                    }
                });
            }
        });
      });
    /*
    socket.on('compile',function(code,input){
        fs.writeFile(__dirname+"/codes/" + socket.room + ".cpp",code,function(err){
            if(err){
                return console.log("Could not write");
            }
            else{
                var msg;
                exec("g++ codes/"+socket.room+".cpp -o " + "codes/" + socket.room,function(error,stdout,stderr){
                    msg=stderr;
                     msg=replaceAll(msg,'\n','<br>');
                               	  msg=replaceAll(msg,"codes",'');
                                  msg=replaceAll(msg,socket.room,'code');
                    if(!msg){
                        fs.writeFile(__dirname+"/codes/" + socket.room + ".txt",input,function(err){
                            if(err){
                                return console.log("Could not write");
                            }
                            else{
                              exec("./codes/"+socket.room+" < codes/" + socket.room + ".txt",function(error,stdout,stderr){
                                  if(stderr)
                                      msg=stderr;
                                  else if(stdout)
                                      msg=stdout;
                                  else
                                      msg="Compilation Successfull."
                         	      msg=replaceAll(msg,'\n','<br>');
                               	  msg=replaceAll(msg,"codes/",'');
                                  msg=replaceAll(msg,socket.room,'code');
                                  io.in(socket.room).emit('compile_msg',msg);
                              });   
                            }
                        });
                    }
                    else
                        io.in(socket.room).emit('compile_msg' , msg);//Send to all in the room including the sender
                });
            }
        });
    })
    */
    socket.on('edited',function(code){
        codes[socket.room]=code;
        socket.broadcast.to(socket.room).emit('edited',code);//Send to all in the room except the sender.
    })



	socket.on('user',function(data){
				names.push(data);
				users[socket.id]=data;
	//			io.sockets.emit('names',names);
	});

	socket.on('chat message',function(message){
			if(message){
				io.in(socket.room).emit('chat message',users[socket.id]+" :: "+message);
				//console.log("Message Emitted from: " + users[socket.id]);
			}
		});

	socket.on('disconnect',function(){
		if( !(socket.id in users )) return;
		var tmp=users[socket.id];
		names.splice(names.indexOf(users[socket.id]),1);
		delete users[socket.id];
		socket.broadcast.to(socket.room).emit('out',tmp);
		socket.broadcast.to(socket.room).emit('names',names);
		});
});
