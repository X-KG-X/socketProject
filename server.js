const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/static"));
// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');

// const session = require('express-session');
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'keyboardkitteh',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { maxAge: 60000 }
// }))

// const server = app.listen(8000);
const server = require('http').createServer(app);
server.listen(8000);
const io = require('socket.io')(server);

let users={};
var players={};
io.on('connection', function (socket) { //2
    socket.on('got_new_user', function(data){
        socket.emit('existing_users',users)
        // console.log("In server-socket.emit")
        // console.log(data.name)
        if (data.name){
            users[socket.id]=data.name
            // console.log("new user**"+data)
            io.emit('new_user', {name:data.name, id:socket.id})
            console.log(users)
            console.log(socket.id)
            players[socket.id]={
                x:100,
                y:100
            }
            console.log(socket.id+"$$$$$$$$")
        }

    })
   socket.on('disconnect', function(){
       console.log("disconnected id:",socket.id)
       io.emit('disconnected_user',socket.id)
       delete users[socket.id]
    //    console.log(users)
   })
   socket.on('new_msg', function(data){
    //    console.log("new_msg: "+data)
        io.emit('new_message', { name: users[socket.id], msg: data})
   })

   socket.on('movement', function(data) {
        console.log("In socket.on movement")
        console.log(players[socket.id]);
        var player = players[socket.id] || {};
        // console.log(player.x,"------", player.y, users[socket.id]);
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
    });

});

setInterval(function() {
    // console.log("in state resresh")
    io.sockets.emit('state', players);
  }, 1000/60);


// Routing
// app.get('/',(request,response)=>{
//     console.log("*********************** in root")
//     response.render('index')
// })
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
  });

