var testerBtn = document.getElementById("tester");
var testBtn = document.getElementById("testGame");
let socket = io('http://localhost:8080');
let players = {};   //Players in your lobby (Left, Top, Right)
let user = "George";
let host;
let lowerhand = new cards.Hand({faceUp:true, y:500});
let lefthand = new cards.Hand({faceUp:true, x:200});
let upperhand = new cards.Hand({faceUp:true, y:80});	
let righthand = new cards.Hand({faceUp:true, x:1000});
let lowerDiscardPile = new cards.Deck({faceUp:true, y:320});
let upperDiscardPile = new cards.Deck({faceUp:true, y:220});
let leftDiscardPile = new cards.Deck({faceUp:true, x:550});
let rightDiscardPile = new cards.Deck({faceUp:true, x:680});
let loc = {};


//Create a new deck of cards
 
//By default it's in the middle of the container, put it slightly to the side


//for (var i = 1; i < 7; i++) {
//    lowerhand.push(new cards.Card("h", i, '#card-table'));
//}

lowerhand.click(function(card){
	
});
lowerhand.render();


testBtn.addEventListener('click', e => {
    testBtn.style.visibility = 'hidden';
    socket.emit('initializeTest', {
        host: "Larry",
        lobby: "Larry's Lobby",
        players: ["Larry", "George", "Paul", "Harry"]
    });
});


socket.on('startGame', data => {
    host = data.host;
    for (var i = 0; i < 4;i++) {
        if (data.players[i] == user) {
            players = {
                left: data.players[(i+1)%4],
                top: data.players[(i+2)%4],
                right: data.players[(i+3)%4]
            };
        }
    }
    for (var i = 0; i < 4;i++) {
        if (data.players[i] == user) {
            //construct deck
        }
    }
    socket.emit('confirmation', {

    });
});

socket.on('runGame', data => {
    testerBtn.style.visibility = 'visible';
    var dealDeck = [];
    for(var i = 0; i < 13; i++) {
        dealDeck.push(data[players.right][i]);
        dealDeck.push(data[players.top][i]);
        dealDeck.push(data[players.left][i]);
        dealDeck.push(data[user][i]);
    }
    cards.init({table:'#card-table'}, dealDeck);
    loc = {
        cards : cards.all,
        names : cards.names
    };
    let deck = new cards.Deck();
    deck.x -= 50;
    deck.addCards(cards.all); 
    deck.render({immediate:true});
    deck.deal(13, [lowerhand, lefthand, upperhand, righthand], 20);
});

testerBtn.addEventListener('click', e => {
    var card = loc.cards[8];
    lowerDiscardPile.addCard(card);
    lowerDiscardPile.render();
    righthand.render();
});
   