const io = require('socket.io')(8080);

io.on('connection', socket => {
    console.log("Root connected");
    socket.on('startGame', playerInfo => {
        var temp = [];
        for(var i = 0;i < 4; i++){
            temp.push({
                player: playerInfo.players[i],
                hand: ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10","h11","h12","h13"],
                size: 13
            });
        }
        socket.emit('response', {
            players: temp
        });
    });
});

