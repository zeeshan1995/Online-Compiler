var express=require('express');
var app=express();
var server=require('http').Server(app);
var fs=require('fs');
var body_parser=require('body-parser');
var sys=require('util');
var exec=require('child_process').exec;
var io=require('socket.io')(server);

app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));

server.listen(8000);

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
})

io.on('connection',function(socket){
    
    socket.on('compile',function(code){
        fs.writeFile(__dirname+"/code.cpp",code,function(err){
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
                    io.emit('compile_msg' , msg);
                });
            }
        });
    })
    
    socket.on('edited',function(code){
        socket.broadcast.emit('edited',code);
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