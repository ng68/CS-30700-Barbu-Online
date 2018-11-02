const io = require('socket.io')(8080);

io.on('connection', socket => {
    console.log("Root connected");
    let tester = [];
    let tester1 = [];
    let tester2 = [];
    let tester3 = [];
    for (var i = 2; i < 15; i++) {
        tester.push('h' + i.toString());
        tester1.push('c' + i.toString());
        tester2.push('s' + (i).toString());
        tester3.push('d' + (i).toString());
    }
    socket.emit('game-finished', {
        Bole : [10, true]
    }); 
} /*
    socket.on('subgame-chosen', data => {
        socket.emit('subgame-choice', {
            gamechoice : data.gamechoice
        });
        socket.emit('your-turn', {
            username : "Larry"
        });
    });

    socket.on('card-chosen', data => {
        socket.emit('card-chosen-response', {
            valid : true,
            cardSuit : data.cardSuit,
            cardValue : data.cardValue,
            username : "Larry"
        });  
    });
});
    /*socket.on('initializeTest', playerInfo => {
        socket.emit('player-joined', {
            username : ["Larry", "George", "Paul", "Harry"]
        });
    });
    
    socket.on('host-start-game', data => {
        socket.emit('start-game', {
            players : ["Larry", "George", "Paul", "Harry"]
        });
        let tester = [];
        let tester1 = [];
        let tester2 = [];
        let tester3 = [];
        for (var i = 2; i < 15; i++) {
            tester.push('h' + i.toString());
            tester1.push('c' + i.toString());
            tester2.push('s' + (i).toString());
            tester3.push('d' + (i).toString());
        }
        socket.emit('cards-dealt', {
            Larry : tester,
            George : tester1,
            Paul : tester2,
            Harry : tester3,
            Size : tester.length
        });
    });
    */


    //socket.on('confirmation', data => {
        
//});

