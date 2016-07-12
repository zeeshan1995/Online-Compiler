var express=require('express');
var app=express();
var server=require('http').Server(app);
var fs=require('fs');
var body_parser=require('body-parser');
var sys=require('util');
var exec=require('child_process').exec;
var io=require('socket.io')(server);
var uid=require('uid');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));

server.listen(8000,function(){console.log('Server is up.');});

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
})
var codes={};
io.on('connection',function(socket){
    
    
    socket.on('new_room',function(a){
        var x=uid();
        socket.room=x;
        socket.join(x);
        socket.emit('room_name',x);
    });
    
    socket.on('join_room',function(a){
        socket.room=a;
        socket.join(a);
        socket.emit('room_name',a);
        socket.emit('edited',codes[socket.room]);
     //   socket.to(socket.room).emit('edited',codes[socket.room]);//Send only to sender in the room
    });
    
    socket.on('compile',function(code){
        fs.writeFile(__dirname+"/" + socket.room + ".cpp",code,function(err){
            if(err){
                return console.log("Could not write");
            }
            else{
                var msg;
                exec("g++ "+socket.room+".cpp -o " + socket.room,function(error,stdout,stderr){
                    msg=stderr;
                    msg=msg.replace('\n',"<br><br>");
                    if(!msg)
                        msg="Compilation Successfull."
                    io.in(socket.room).emit('compile_msg' , msg);//Send to all in the room including the sender
                });
            }
        });
    })
    
    socket.on('edited',function(code){
        codes[socket.room]=code;
        socket.broadcast.to(socket.room).emit('edited',code);//Send to all in the room except the sender.
    })
});




/*
app.post('/compile',function(req,res){
    fs.writeFile(__dirname+"/code.cpp",req.body.code,function(err){
        if(err){
            return console.log("Could not write");
        }
        else{
            var msg;
            exec("g++ code.cpp",function(error,stdout,stderr){
                console.log("Compiling");
                msg=stderr;
                if(msg)
                    console.log("Not empty error.");//\nError::\n"+ msg)
                else{
                    console.log("compilation Successfull");
                    msg="Compilation Successfull."
                }
                console.log("msg::"+msg);
                res.send(msg);
            });
        }
    });
});*/