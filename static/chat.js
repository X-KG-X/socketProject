$(document).ready(function (){
    const socket = io(); 
    let name= prompt("Enter your preferred name!","Dude");
    socket.emit('got_new_user',{name:name});
    socket.on('existing_users',function(data){
        for(let i in data ){
            $('#sidebar').append('<p id='+i+'>'+data[i]+'</p>')
        }
    })
    socket.on('new_user',function(data){
        $('#sidebar').append('<p id='+data.id+'>'+data.name+'</p>')
    })
    socket.on('disconnected_user',function(data){
        $('#'+data).remove();
    })
    $('#message').keypress(function(event){            
        if (event.which==13){
            let new_msg=$('#message').val()
            socket.emit('new_msg',new_msg)
            $('#message').val('')
            return false
        }   
    })
    $('#send').click(function(){
        let new_msg=$('#message').val()
        socket.emit('new_msg',new_msg)
        $('#message').val('')
    })
    socket.on('new_message',function(data){
        $('#chat_box').append('<p>'+data.name+':  '+data.msg+'</p>')
        $('#chat_box').stop().animate({scrollTop: $('#chat_box')[0].scrollHeight},1000);
    })

    //Canvas
    var movement = {
        up: false,
        down: false,
        left: false,
        right: false
    }
    document.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 37: // LEFT
            movement.left = true;
            break;
            case 38: // UP
            movement.up = true;
            break;
            case 39: // RIGHT
            movement.right = true;
            break;
            case 40: // DOWN
            movement.down = true;
            break;
        }
    });
    document.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case 37: // LEFT
            movement.left = false;
            break;
            case 38: // UP
            movement.up = false;
            break;
            case 39: // RIGHT
            movement.right = false;
            break;
            case 40: // DOWN
            movement.down = false;
            break;
        }
    });
  
    setInterval(function() {
        socket.emit('movement', {movement:movement, socketId:socket.id});
        }, 1000/60);
    
    var canvas = document.getElementById('myCanvas');
    canvas.width=500;
    canvas.height=500;
    var context = canvas.getContext('2d');
    var tagger;
    socket.on('state', function(data) {
        numPlayers=Object.keys(data).length;
        context.clearRect(0, 0, 500, 500);
        for (var id in data) {
            var player = data[id];
            context.fillStyle =player.color ;
            context.beginPath();
            context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
            context.strokeText(player.name,player.x,player.y+20)
            if(player.tagger){
                tagger=player.name;
            }
        }
        $("#tagger").text(tagger);
        socket.on('reset', function(data){
            $("#resetFlash").text(data.name + " IS THE TAGGER NOW");
            setTimeout(function(){$("#resetFlash").text('');},3600);
        })
    });
    
    var seconds=0;
    var interval;
    socket.on('startTime',function(data){
        if(data){
            clearInterval(interval);
            interval=setInterval(startTimer,100);
        }
        else{
            clearInterval(interval);
            stopTimer();
        }
    })
    function startTimer(){
        seconds++;
        $('#timer').text(seconds);
    }
    var numPlayers;
    function stopTimer(){
        let score=seconds;
        seconds=0;
        $('#timer').text(seconds);
        socket.emit('score',{name:tagger, tags:numPlayers, time:score})
    }

    socket.on('display',function(data){
        if(data){
            $('#display').text('');
            data.forEach(element => {
                $('#display').append(`<ul>${element._id} players tagged in ${element.minTime} seconds</ul>`);
            });
        }
    })
 })