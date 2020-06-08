
var stopwatch;
function start(){
    let x=Date.now()
    let result=0;
    stopwatch=setInterval(function(){
        result=Date.now()-x;
        $('#stopwatch').text(result);
    })
}



function stop(){
    console.log($('#stopwatch').text()+"###########")
    clearInterval(stopwatch);
    $('#stopwatch').text(0)
}


start();

// stop();
setTimeout(function(){stop();}, 3000)