const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));

const server = require('http').createServer(app);
server.listen(8000);
const io = require('socket.io')(server);

let users={};
let players={};
io.on('connection', function (socket) { 
    socket.on('got_new_user', function(data){
        socket.emit('existing_users',users)
        if (data.name){
            users[socket.id]=data.name
            io.emit('new_user', {name:data.name, id:socket.id})
            players[socket.id]={
                x:Math.floor(Math.random() * 300) + 1,
                y:Math.floor(Math.random() * 300) + 1,
                name:data.name,
                tagger:false,
                color:getRandomColor()
            }
            if(Object.keys(players).length===1){
                players[socket.id].tagger=true;
            }
        }
    })

   socket.on('disconnect', function(){
       io.emit('disconnected_user',socket.id)
       delete users[socket.id]
       delete players[socket.id]
   })

   socket.on('new_msg', function(data){
        io.emit('new_message', { name: users[socket.id], msg: data})
   })

   socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        if (!collision(player, socket.id, players)) {
            if(data.left){player.x > 0 ? player.x -= 5 : player.x = 495;}
            if(data.up){player.y > 0 ? player.y -= 5 : player.y = 495;}
            if(data.right){player.x < 500 ? player.x += 5 : player.x = 5;}
            if(data.down){player.y < 500 ? player.y += 5 : player.y = 5;}
            }
            else {
            if(data.left){player.x > 0 ? player.x += 75 : player.x = 495;}
            if(data.right){player.y > 0 ? player.y += 75 : player.y = 495;}
            if(data.up){player.x < 500 ? player.x -= 75 : player.x = 5;}
            if(data.down){player.y < 500 ? player.y -= 75 : player.y = 5;}
            }

        // Collision Detection
        function collision(player,socketId,players){
            if(Object.keys(players).length>1){
                for(let [key,value] of Object.entries(players)){
                    if(key!==socketId){
                        if(Math.sqrt(Math.pow((player.x-value.x),2)+Math.pow((player.y-value.y),2))<21){ 
                            if(player.tagger){
                                value.color=player.color;
                            }
                            return true;
                        }
                    }
                }
            }
        }

        function gameOver(){
            let result=false;
            let valueArr=Object.values(players);
            if(valueArr.length){
                let color=valueArr[0].color;
                for(let value of valueArr){
                    if(color===value.color &&valueArr.length>1){
                        result=true;
                    }
                    else{
                        result=false;
                        break;
                    }
                }
            }
            return result;
        }

        if(gameOver()){
            socket.emit('game_over',{isGameOver:true})
            for(let value of Object.values(players)){
                value.color=getRandomColor();
                value.x=Math.floor(Math.random() * 300) + 1;
                value.y=Math.floor(Math.random() * 300) + 1;
            }
            pickTagger();
        }
        function pickTagger(){
            for(let value of Object.values(players)){
                value.tagger=false;
            }
            let count=Object.keys(players).length;
            Object.values(players)[Math.floor(Math.random()*count)].tagger=true;
            socket.emit('reset',true);
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
  })