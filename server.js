const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));

const server = require('http').createServer(app);
server.listen(8000);
const io = require('socket.io')(server);

let users={};
let players={};
io.on('connection', function (socket) { //2
    socket.on('got_new_user', function(data){
        socket.emit('existing_users',users)
        if (data.name){
            users[socket.id]=data.name
            io.emit('new_user', {name:data.name, id:socket.id})
            console.log(users)
            console.log(socket.id)
            players[socket.id]={
                x:Math.floor(Math.random() * 500) + 1,
                y:Math.floor(Math.random() * 500) + 1,
                color:getRandomColor()
            }
            console.log(players)
        }
    })
   socket.on('disconnect', function(){
       console.log("disconnected id:",socket.id)
       io.emit('disconnected_user',socket.id)
       delete users[socket.id]
       delete players[socket.id]
   })
   socket.on('new_msg', function(data){
        io.emit('new_message', { name: users[socket.id], msg: data})
   })

   socket.on('movement', function(data) {
        console.log("In socket.on movement")
        console.log(players[socket.id]);
        var player = players[socket.id] || {};
        console.log(collision(player,socket.id,players));
        if (data.left ) {
            if(player.x>0){
                player.x -= 5;
            }
            else{
                player.x=500;
            }
        }
        if (data.up) {
            if(player.y>0){
                player.y -= 5;
            }
            else{
                player.y=400;
            }
        }
        if (data.right) {
            if(player.x<500){
                player.x += 5;
            }
            else{
                player.x=0;
            }
        }
        if (data.down ) {
            if(player.y<400){
                player.y += 5;
            }
            else{
                player.y=0;
            }
        }
        // Collision Detection
        function collision(player,socketId,players){
            let playersCopy=Object.assign({},players);
            delete playersCopy[socketId];
            if(Object.keys(playersCopy).length>0){
                for(let one of Object.values(playersCopy)){
                    if(((player.y + 10) < (one.y)) ||
                    (player.y > (one.y + 10)) ||
                    ((player.x + 10) < one.x) ||
                    (player.x > (one.x + 10))){
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            }
        }
    });
});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


setInterval(function() {
    io.sockets.emit('state', players);
  }, 1000/60);


// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
  });