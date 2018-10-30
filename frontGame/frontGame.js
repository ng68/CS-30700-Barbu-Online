var startGameBtn = document.getElementById("startGame");
var testBtn = document.getElementById("testGame");
let socket = io('http://localhost:8080');
let players = {};

startGameBtn.addEventListener('click', e => {
    socket.emit('startGame', {
        host: "host",
        lobby: "lobby",
        players: ["host", "george", "paul", "harry"]
    });
});

socket.on('response', data => {
    lowerhand = new cards.Hand({faceUp:true, y:500});
    for (var i = 0; i < data.players[0].size; i++) {
        lowerhand.push(new cards.Card(data.players[0].hand[i].substring(0,1), data.players[0].hand[i].substring(1), '#card-table'));
    }
    players = {
        left: data.players[1].player,
        top: data.players[2].player,
        right: data.players[3].player
    };
    lowerhand.render({immediate:true});
});

testBtn.addEventListener('click', e => {
    console.log(players.left);
    console.log(players.top);
    console.log(players.right);
});

/*cards.init({table:'#card-table'});
    lowerhand = new cards.Hand({faceUp:true});
    for (var i = 1; i <= 5; i++) {
        lowerhand.push(new cards.Card('h', i, '#card-table'));
        lowerhand.push(new cards.Card('s', i, '#card-table'));
        lowerhand.push(new cards.Card('d', i, '#card-table'));
        lowerhand.push(new cards.Card('c', i, '#card-table'));
    }
    lowerhand.render({immediate:true});
    */

    
    
   