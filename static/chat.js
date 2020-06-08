//Prompt asks you for your name in the beginning of the game, writing in a default valut of Dude for the name.
$(document).ready(function () {
    const socket = io();
    let name = prompt("Enter your preferred name!", "Dude");
    socket.emit('got_new_user', { name: name });

    // Creates a new p tag and adds the users name to the html in the chat window.
    socket.on('existing_users', function (data) {
        for (let i in data) {
            $('#sidebar').append('<p id=' + i + '>' + data[i] + '</p>')
        }
    })
    socket.on('new_user', function (data) {
        $('#sidebar').append('<p id=' + data.id + '>' + data.name + '</p>')
    })

    //Removes user from the game
    socket.on('disconnected_user', function (data) {
        $('#' + data).remove();
    })

    //Allows user to submit messages via the Enter key (13).
    $('#message').keypress(function (event) {
        if (event.which == 13) {
            let new_msg = $('#message').val()
            socket.emit('new_msg', new_msg)
            $('#message').val('')
            return false
        }
    })

    // User can send messages via the Send Query button
    $('#send').click(function () {
        let new_msg = $('#message').val()
        socket.emit('new_msg', new_msg)
        $('#message').val('')
    })
    socket.on('new_message', function (data) {
        $('#chat_box').append('<p>' + data.name + ':  ' + data.msg + '</p>')
        $('#chat_box').stop().animate({ scrollTop: $('#chat_box')[0].scrollHeight }, 1000);
    })

    //Canvas
    let movement = {
        up: false,
        down: false,
        left: false,
        right: false
    }

    // When key is held down then user character should move in that direction
    document.addEventListener('keydown', function (event) {
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

    // When the key is released then the user should stop moving in that direction
    document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 65: // A
                movement.left = false;
                break;
            case 87: // W
                movement.up = false;
                break;
            case 68: // D
                movement.right = false;
                break;
            case 83: // S
                movement.down = false;
                break;
        }
    });

    //Set the movement intervals
    setInterval(function () {
        socket.emit('movement', { movement: movement, socketId: socket.id });
    }, 1000 / 60);

    let canvas = document.getElementById('myCanvas');
    let maxWidth = canvas.width = 500;
    let maxHeight = canvas.height = 500;


    socket.on('state', function (data) {
        let tagger;
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, maxWidth, maxHeight);
        for (let id in data) {
            let player = data[id];
            context.fillStyle = player.color;
            context.beginPath();
            context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
            context.strokeText(player.name, player.x, player.y + 20)
            if (player.tagger) {
                tagger = player.name;
            }
        }
        $("#tagger").text(tagger);
        socket.on('reset', function (data) {
            $("#resetFlash").text(data.name + " IS THE TAGGER NOW");
            setTimeout(function () { $("#resetFlash").text(''); }, 3600);
        })
    });


    socket.on('startTime', function (data) {
        let interval;
        if (data) {
            clearInterval(interval);
            interval = setInterval(startTimer, 100);
        }
        else {
            clearInterval(interval);
            stopTimer();
        }
    })


    let seconds = 0;

    function startTimer() {
        seconds++;
        $('#timer').text(seconds);
    }


    function stopTimer() {
        seconds = 0;
        $('#timer').text(seconds);
    }

})