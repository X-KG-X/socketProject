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
 })