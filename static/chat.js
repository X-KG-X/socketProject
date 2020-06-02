$(document).ready(function (){
    const socket = io(); //1
    let name= prompt("Enter your preferred name!");
    socket.emit('got_new_user',{name:name});
    socket.on('existing_users',function(data){
        // console.log(data)
        for(let i in data ){
            console.log("this is socket id:",i)
            $("#sidebar").append('<p id='+i+'>'+data[i]+'</p>')
        }
    })
    socket.on('new_user',function(data){
        // console.log("newwwwww"+data)
        $("#sidebar").append('<p id='+data.id+'>'+data.name+"</p>")
    })
    socket.on('disconnected_user',function(data){
        // console.log("A disconnect happened--------")
        // console.log("in disconnected",data)
        // console.log('#'+data)
        $('#'+data).remove();
    })
    $("#message").keypress(function(event){            
        if (event.which==13){
            let new_msg=$("#message").val()
            socket.emit('new_msg',new_msg)
            $("#message").val('')
            return false
        }   
    })
    $("#send").click(function(){
        let new_msg=$("#message").val()
        socket.emit('new_msg',new_msg)
        $("#message").val('')
    })
    socket.on('new_message',function(data){
        // console.log("new message reemmited by server: " +data.name+"  "+ data.msg)
        $("#chat_box").append("<p>"+data.name+":  "+data.msg+"</p>")
        $("#chat_box").stop().animate({scrollTop: $("#chat_box")[0].scrollHeight},1000);
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
            case 65: // A
            movement.left = true;
            break;
            case 87: // W
            movement.up = true;
            break;
            case 68: // D
            movement.right = true;
            break;
            case 83: // S
            movement.down = true;
            break;
        }
    });
    document.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case 65: // A
            console.log("pressed A");
            console.log(socket.id+"#########")
            movement.left = false;
            break;
            case 87: // W
            console.log("pressed W");
            console.log(socket.id+"#########")
            movement.up = false;
            break;
            case 68: // D
            console.log("pressed D");
            console.log(socket.id+"#########")
            movement.right = false;
            break;
            case 83: // S
            console.log("pressed S");
            console.log(socket.id+"#########")
            movement.down = false;
            break;
        }
    });
    
    setInterval(function() {
        socket.emit('movement', movement);
        }, 1000/60);
    
    var canvas = document.getElementById('myCanvas');
    canvas.width=500;
    canvas.height=400;
    console.log(canvas)
    var context = canvas.getContext('2d');
    console.log(context);
    socket.on('state', function(players) {
        // console.log("CheckCheck")
        context.clearRect(0, 0, 500, 400);
        context.fillStyle = "#FF0000";
        for (var id in players) {
            var player = players[id];
            console.log(player+"==========");
            context.beginPath();
            context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
            context.fill();
        }
    
    });
 })