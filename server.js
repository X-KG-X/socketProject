//Needed to set up the server
const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));

const server = require('http').createServer(app);
server.listen(8000);
const io = require('socket.io')(server);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tag',{useNewUrlParser:true,useUnifiedTopology: true});
const ScoreSchema = new mongoose.Schema({
    name: String,
    tags: Number,
    time: Number
    },
    {timestamps:true}
)
const Score = mongoose.model('Score', ScoreSchema);

let users={};
let players={};
var timerTrigger=false;
var previousTagger;
io.on('connection', function (socket) { 

    displayScore();

    //Get new user and assign them to a random location on the screen with a random color.
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

    function displayScore(){
        Score.aggregate([{$group:{_id:"$tags",minTime:{$min:"$time"}}},{$sort:{minTime:1,_id:1}}])
            .then(data=>{socket.emit('display',data)})
            .catch(err=>console.log(err))
    }

    //Start and stop Timer functions
    function startTimer(){
        socket.emit('startTime',true)
        timerTrigger=true;
    }
    function stopTimer(){
        socket.emit('startTime', false)
        timerTrigger=false;
    }

    //On disconnect of the tagger, a new tagger is then chosen at random
   socket.on('disconnect', function(){
       io.emit('disconnected_user',socket.id)
       delete users[socket.id]
       delete players[socket.id]
       pickTagger()
   })

   //emit new message to the chat board
   socket.on('new_msg', function(data){
        io.emit('new_message', { name: users[socket.id], msg: data})
   })

   //Once the tagger starts moving on the screen, then the timer starts
   socket.on('movement', function(data) {
        if(!timerTrigger&&players[data.socketId]){
            if(players[data.socketId].tagger&&(data.movement.up||data.movement.down||data.movement.left||data.movement.right)){
                startTimer();
                previousTagger=players[data.socketId];
            }
        }

        //Keeps all the players in bounds the width and height of the board
        let player = players[socket.id] || {};
        if (!collision(player, socket.id, players)) {
            if(data.movement.left){player.x > 0 ? player.x -= 5 : player.x = 495;}
            if(data.movement.up){player.y > 0 ? player.y -= 5 : player.y = 495;}
            if(data.movement.right){player.x < 500 ? player.x += 5 : player.x = 5;}
            if(data.movement.down){player.y < 500 ? player.y += 5 : player.y = 5;}
            }
            else {
            if(data.movement.left){player.x > 0 ? player.x += 75 : player.x = 495;}
            if(data.movement.up){player.y > 0 ? player.y += 75 : player.y = 495;}
            if(data.movement.right){player.x < 500 ? player.x -= 75 : player.x = 5;}
            if(data.movement.down){player.y < 500 ? player.y -= 75 : player.y = 5;}
            socket.emit('audio',true)
            }

        // Collision Detection
        //Upon collision you and the other player will bounce off of one another as well as you changing their color to your color.
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
        //When the game is over everyones color gets reset and a new tagger is assigned
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

        //When the game is over everyones color gets reset and a new tagger is assigned
        if(gameOver()){
            for(let value of Object.values(players)){
                value.color=getRandomColor();
                value.x=Math.floor(Math.random() * 300) + 1;
                value.y=Math.floor(Math.random() * 300) + 1;
            }
            stopTimer();
            pickTagger();
            displayScore();
        }
    });
    
    socket.on('score',function(data){
        const score=new Score();
        score.name=data.name;
        score.tags=data.tags;
        score.time=data.time;
        score.save()
        .then(newScore=>console.log('score created: ', newScore))
        .catch(err=>console.log(err));
    })

    // Tagger is picked and doesnt allow the same tagger twice in a row.
    function pickTagger(){
        for(let value of Object.values(players)){
            value.tagger=false;
        }
        let count=Object.keys(players).length;
        let newTagger=Object.values(players)[Math.floor(Math.random()*count)];
        if(newTagger!=previousTagger){
            newTagger.tagger=true;
            socket.emit('reset',newTagger);
        }
        else{
            pickTagger()
        }

    }
});

//Sets the random color for the players
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