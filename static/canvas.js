// var socket=io();


// var movement = {
//     up: false,
//     down: false,
//     left: false,
//     right: false
// }
// document.addEventListener('keydown', function(event) {
//     switch (event.keyCode) {
//         case 65: // A
//         movement.left = true;
//         break;
//         case 87: // W
//         movement.up = true;
//         break;
//         case 68: // D
//         movement.right = true;
//         break;
//         case 83: // S
//         movement.down = true;
//         break;
//     }
// });
// document.addEventListener('keyup', function(event) {
//     switch (event.keyCode) {
//         case 65: // A
//         console.log("pressed A");
//         console.log(socket.id+"#########")
//         movement.left = false;
//         break;
//         case 87: // W
//         movement.up = false;
//         break;
//         case 68: // D
//         movement.right = false;
//         break;
//         case 83: // S
//         movement.down = false;
//         break;
//     }
// });

// setInterval(function() {
//     socket.emit('movement', movement);
//     }, 3000);

// var canvas = document.getElementById('myCanvas');
// canvas.width=500;
// canvas.height=400;
// console.log(canvas)
// var context = canvas.getContext('2d');
// console.log(context);
// socket.on('state', function(players) {
//     // console.log("CheckCheck")
//     context.clearRect(0, 0, 500, 400);
//     context.fillStyle = "#FF0000";
//     for (var id in players) {
//         var player = players[id];
//         console.log(player+"==========");
//         context.beginPath();
//         context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
//         context.fill();
//     }

// });