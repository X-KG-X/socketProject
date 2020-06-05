const express = require('express');
const app = express();

//TODO Import node fs module to start creating/writing to files.
let fs = require("fs");

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));

const server = require('http').createServer(app);
server.listen(8000);
const io = require('socket.io')(server);

let users={};
let players={};

io.on('connection', function (socket) { 
    let createStream = fs.createWriteStream("highScores.txt");
createStream.end();

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
       console.log("disconnected id:",socket.id)
       io.emit('disconnected_user',socket.id)
       delete users[socket.id]
       delete players[socket.id]
   })
   socket.on('new_msg', function(data){
        io.emit('new_message', { name: users[socket.id], msg: data})
   })

   socket.on('movement', function(data) {
        console.log(data);
        console.log("In socket.on movement")
        console.log(players);
        console.log(players[socket.id]);
        console.log(socket.id+" ssssssssss")
        var player = players[socket.id] || {};

        if (!collision(player, socket.id, players)) {
            if(data.left){player.x > 0 ? player.x -= 5 : player.x = 495;}
            if(data.up){player.y > 0 ? player.y -= 5 : player.y = 395;}
            if(data.right){player.x < 500 ? player.x += 5 : player.x = 5;}
            if(data.down){player.y < 400 ? player.y += 5 : player.y = 5;}
        }
        else {
            if(data.left){player.x > 0 ? player.x += 20 : player.x = 495;}
            if(data.right){player.y > 0 ? player.y += 20 : player.y = 395;}
            if(data.up){player.x < 500 ? player.x -= 20 : player.x = 5;}
            if(data.down){player.y < 400 ? player.y -= 20 : player.y = 5;}
        }


        // Collision Detection
        function collision(player,socketId,players){
            console.log(socketId+"  "+socket.id);
            if(Object.keys(players).length>1){
                for(let [key,value] of Object.entries(players)){
                    if(key!==socketId){
                        if(Math.sqrt(Math.pow((player.x-value.x),2)+Math.pow((player.y-value.y),2))<21){ 
                            console.log(value.name+" 's color is "+ value.color+" "+player.name+" 's color is "+ player.color)
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

            writeData();
            fs.readFile('highScores.txt', 'utf8', readData);

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
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TODO This is the file creating/writing for the High scores. Having the file written on connection of the game seems fine.

//on connection
let createStream = fs.createWriteStream("highScores.txt");
createStream.end();

// on game over
function writeData(){
    let writeStream = fs.createWriteStream("highScores.txt");
    writeStream.write("HIGH SCORES!");
    writeStream.write(`User: Rick     Score: 5 seconds`);
    writeStream.write(`User: Morty     Score: 12 seconds`);
    writeStream.write(`User: Summer     Score: 20 seconds`);
    writeStream.end();
}

// on button click : on game over as well but dispay to bottom of screen
function readData(err, data) {
    console.log(data);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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