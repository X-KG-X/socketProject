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
            players[socket.id]={
                x:Math.floor(Math.random() * 500) + 1,
                y:Math.floor(Math.random() * 500) + 1,
                name:data.name,
                smash:false,
                color:getRandomColor()
            }
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
        console.log(players);
        console.log(players[socket.id]);
        var player = players[socket.id] || {};
        player.smash=collision(player,socket.id,players);
        if(!player.smash){
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
        }
        else{
            if (data.left ) {
                if(player.x>0){
                    player.x += 20;
                }
                else{
                    player.x=500;
                }
            }
            if (data.up) {
                if(player.y>0){
                    player.y += 20;
                }
                else{
                    player.y=400;
                }
            }
            if (data.right) {
                if(player.x<500){
                    player.x -= 20;
                }
                else{
                    player.x=0;
                }
            }
            if (data.down ) {
                if(player.y<400){
                    player.y -= 20;
                }
                else{
                    player.y=0;
                }
            }
        }
        // Collision Detection
        function collision(player,socketId,players){
            let playersCopy=Object.assign({},players);
            // console.log(JSON.stringify(playersCopy)+"%%%%%%%%%%%")
            // console.log(players)
            delete playersCopy[socketId];
            // console.log(JSON.stringify(playersCopy)+"^^^^^^^^^^")
            if(Object.keys(playersCopy).length>0){
                for(let one of Object.values(playersCopy)){
                    if(((player.y + 21) < (one.y)) ||
                    (player.y > (one.y + 21)) ||
                    ((player.x + 21) < one.x) ||
                    (player.x > (one.x + 21))){
                        return false;
                    }
                    else{
                        one.color=player.color;
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
  }, 1000/10);


// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
  });