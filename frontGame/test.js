const io = require('socket.io')(8080);

io.on('connection', socket => {
    console.log("Root connected");
    socket.on('initializeTest', playerInfo => {
        
        socket.emit('startGame', {
            players: playerInfo.players,
            
            size: 13,
            host: playerInfo.players[0]
        });
    });

    socket.on('confirmation', data => {
        let tester = [];
        let tester1 = [];
        let tester2 = [];
        let tester3 = [];
        for (var i = 13; i > 0; i--) {
            tester.push('h' + i.toString());
            tester1.push('c' + i.toString());
            tester2.push('s' + i.toString());
            tester3.push('d' + i.toString());
        }
        socket.emit('runGame', {
            Larry : tester,
            George : tester1,
            Paul : tester2,
            Harry : tester3
        });
    });
});

