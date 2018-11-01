let socket = io('http://localhost:8080'); //Socket
//emit "connected"
var testerBtn = document.getElementById("tester");  //Testing button
var testBtn = document.getElementById("testGame");  //Testing button
let befPlayers = [];
let subgameList = ["Fan Tan", "No Hearts", "No King","No Last Two", "No Queens","No Tricks", "Trumps"];
let players = {};   //Players in your lobby (Left, Top, Right)
let user = "Larry";  //Current User
let currentDealer = 0;
let currentSubgame;
let host;  //Name of host
let lobby = "Lobby";
let myPosition;  //Current user position relative to other players
let currentTurn = 1;  //Turn counter
let lowerhand = new cards.Hand({faceUp:true, y:500});  //Initializing all of the visuals for hands and discard piles
let lefthand = new cards.Hand({faceUp:false, x:200});
let upperhand = new cards.Hand({faceUp:false, y:80});	
let righthand = new cards.Hand({faceUp:false, x:1000});
let lowerDiscardPile = new cards.Deck({faceUp:true, y:320});
let upperDiscardPile = new cards.Deck({faceUp:true, y:220});
let leftDiscardPile = new cards.Deck({faceUp:true, x:550});
let rightDiscardPile = new cards.Deck({faceUp:true, x:680});
let loc = {};  //Keeps track of the reference to the location of each Card

/*socket.on('player-joined', data => {
    befPlayers = data.username;
    host = befPlayers[0];
    if (befPlayers.length === 4 && host === user) {
        testerBtn.style.visibility = 'visible';
    }
});
*/

//When the game is started.
/*testerBtn.addEventListener('click', e => {
    socket.emit('host-start-game', {
        lobbyname : lobby
    });
});
*/

//Used to test with test.js
/*testBtn.addEventListener('click', e => {
    testBtn.style.visibility = 'hidden';
    socket.emit('initializeTest', {
        host: "Larry",
        lobby: "Larry's Lobby",
        players: ["Larry", "George", "Paul", "Harry"]
    });
});
*/
//Once the game has been started by the host we figure out where each player is and initialize variables.
socket.on('start-game', data => {
    host = data.players[0];
    for (var i = 0; i < 4;i++) {
        if (data.players[i] === user) {
            myPosition = i;
            players = {
                left: data.players[(i+1)%4],
                top: data.players[(i+2)%4],
                right: data.players[(i+3)%4]
            };
        }
    }
    //socket.emit('confirmation', {
    //    lobbyname : lobby
    //});
});

//Run this for each subgame that we run this also populates the hands.
socket.on('cards-dealt', data => {
    $('.card').remove();  //Initializing all of the visuals for hands and discard piles
    var dealDeck = [];
    for(var i = 0; i < data.Size; i++) {
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
    deck.addCards(cards.all); 
    deck.render({immediate:true});
    deck.deal(13, [lowerhand, lefthand, upperhand, righthand], 50);
    //prompt with subgame choice if dealer
    if (myPosition === currentDealer) {
        let temp = "";
        for (var i = 0; i < subgameList.length; i++) {
            temp += "<input type=\"radio\" name=\"subgame\" value=\"" + subgameList[i] + "\"> " + subgameList[i] + "<br>";
        }
        document.getElementById("radio-home").innerHTML = temp;
        //Bring up subgame prompt
        $('#myModal').modal('show');
        socket.emit('subgame-chosen', {
            lobbyname : lobby, 
            gamechoice : "Hearts"
        });
    }else {
        //Waiting prompt
        $('#waitingModal').modal('show');
    }
});

function chooseSubgame (){
    if ($('input[name=subgame]:checked').length > 0) {
        // do something here
        let chosen = document.querySelector('input[name = "subgame"]:checked').value;
        for(var i = 0; i < subgameList.length; i++){ 
            if (subgameList[i] === chosen) {
              subgameList.splice(i, 1); 
            }
         }
        $('#myModal').modal('hide');
    }
    
}

socket.on('subgame-choice', data => {
    currentSubgame = data.gamechoice;
});

//Ability to click your own hand when it is your turn.
lowerhand.click(function(card){
    if (currentTurn === myPosition) {
        //Do legal play check
        //If legal
        currentTurn = (currentTurn + 1) % 4;
        lowerDiscardPile.addCard(card);
	    lowerDiscardPile.render();
	    lowerhand.render();
    }
});

//When someone else plays a card we need to update the visuals.
socket.on('playCard', data => {

});




   