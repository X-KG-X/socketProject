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
                x:Math.floor(Math.random() * 495) + 1,
                y:Math.floor(Math.random() * 495) + 1,
                name:data.name,
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
        if(!collision(player,socket.id,players)){
            if (data.left ) {
                if(player.x>0){
                    player.x -= 5;
                }
                else{
                    player.x=495;
                }
            }
            if (data.up) {
                if(player.y>0){
                    player.y -= 5;
                }
                else{
                    player.y=395;
                }
            }
            if (data.right) {
                if(player.x<500){
                    player.x += 5;
                }
                else{
                    player.x=5;
                }
            }
            if (data.down ) {
                if(player.y<400){
                    player.y += 5;
                }
                else{
                    player.y=5;
                }
            }
        }
        else{
            if (data.left ) {
                if(player.x>0){
                    player.x += 20;
                }
                else{
                    player.x=495;
                }
            }
            if (data.up) {
                if(player.y>0){
                    player.y += 20;
                }
                else{
                    player.y=395;
                }
            }
            if (data.right) {
                if(player.x<500){
                    player.x -= 20;
                }
                else{
                    player.x=5;
                }
            }
            if (data.down ) {
                if(player.y<400){
                    player.y -= 20;
                }
                else{
                    player.y=5;
                }
            }
        }
        // Collision Detection
        function collision(player,socketId,players){
            if(Object.keys(players).length>1){
                for(let [key,value] of Object.entries(players)){
                    if(key!==socketId){
                        console.log(key+"############"+value.x+"  "+player.x)
                        if(Math.sqrt(Math.pow((player.x-value.x),2)+Math.pow((player.y-value.y),2))<21){ 
                            value.color=player.color;
                            return true;
                        }
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