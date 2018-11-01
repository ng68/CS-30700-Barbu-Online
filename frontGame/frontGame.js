let socket = io('http://localhost:8080'); //Socket
//emit "connected"
var testerBtn = document.getElementById("tester");  //Testing button
var testBtn = document.getElementById("testGame");  //Testing button
let subgameList = ["Fan Tan", "No Hearts", "No King","No Last Two", "No Queens","No Tricks", "Trumps"];
let players = {};   //Players in your lobby (Left, Top, Right)
let user = "Larry";  //Current User
let currentDealer = 0;
let currentSubgame;
let lobby = "Lobby";
let myTurn = false;  //Current user position relative to other players
let lowerhand = new cards.Hand({faceUp:true, y:500});  //Initializing all of the visuals for hands and discard piles
let lefthand = new cards.Hand({faceUp:false, x:200});
let upperhand = new cards.Hand({faceUp:false, y:80});	
let righthand = new cards.Hand({faceUp:false, x:1000});
let lowerDiscardPile = new cards.Deck({faceUp:true, y:320});
let upperDiscardPile = new cards.Deck({faceUp:true, y:220});
let leftDiscardPile = new cards.Deck({faceUp:true, x:550});
let rightDiscardPile = new cards.Deck({faceUp:true, x:680});
let lowerTrickPile = new cards.Deck({faceUp:true, x:700, y:450});
let upperTrickPile = new cards.Deck({faceUp:true, x:200, y:160});
let leftTrickPile = new cards.Deck({faceUp:true, x:300, y:250});
let rightTrickPile = new cards.Deck({faceUp:true, x:900, y:100});
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
    currentDealer = data.user;
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
    if (user === currentDealer) {
        let temp = "";
        for (var i = 0; i < subgameList.length; i++) {
            temp += "<input type=\"radio\" name=\"subgame\" value=\"" + subgameList[i] + "\"> " + subgameList[i] + "<br>";
        }
        document.getElementById("radio-home").innerHTML = temp;
        //Bring up subgame prompt
        $('#myModal').modal('show');
    }else {
        //Waiting prompt
        $('#waitingModal').modal('show');
    }
});

function chooseSubgame (){
    if ($('input[name=subgame]:checked').length > 0) {
        // do something here
        let chosen = document.querySelector('input[name = "subgame"]:checked').value;
        currentSubgame = chosen; 
        socket.emit('subgame-chosen', {
            lobbyname : lobby, 
            gamechoice : chosen
        });
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
    window.alert(currentSubgame);
    //update a visual to let everyone know what subgame is being played
});

//Ability to click your own hand when it is your turn.
lowerhand.click(function(card){
    if (myTurn) {
        //Do legal play check
        //If legal
        myTurn = false;
        socket.emit('card-chosen', {
            lobbyname : lobby,
            card : card.name
        });
    }
});

socket.on('your-turn', data =>{
    if (data.user === user) {
        myTurn = true;
        window.alert("It's your turn!");
    }
});

//When someone else plays a card we need to update the visuals.
socket.on('played-card', data => {
    let tempCard;
    for (var i = 0; i < loc.names.length; i++) {
        if (data.card === loc.names[i]) {
            tempCard = loc.cards[i];
        }
    }
    if (data.user === players.left) {
        leftDiscardPile.addCard(tempCard);
	    leftDiscardPile.render();
	    lefthand.render();
    }else if (data.user === players.top){
        upperDiscardPile.addCard(tempCard);
	    upperDiscardPile.render();
	    upperhand.render();
    }else if (data.user === players.right){
        rightDiscardPile.addCard(tempCard);
	    rightDiscardPile.render();
	    righthand.render();
    }else if (data.user === user){
        lowerDiscardPile.addCard(tempCard);
	    lowerDiscardPile.render();
	    lowerhand.render();
    }else {
        window.alert("Error: Invalid user for played-card");
    }
});

socket.on('game-update', data => {

});

socket.on('game-finished', data => {

});

socket.on('trick-won', data => {
    if (data.user === players.left) {
        leftTrickPile.addCard(leftDiscardPile.topCard());
        leftTrickPile.addCard(upperDiscardPile.topCard());
        leftTrickPile.addCard(rightDiscardPile.topCard());
        leftTrickPile.addCard(lowerDiscardPile.topCard());
        leftDiscardPile.render();
        upperDiscardPile.render();
        rightDiscardPile.render();
        lowerDiscardPile.render();
        leftTrickPile.render();
    }else if (data.user === players.top){
        upperTrickPile.addCard(leftDiscardPile.topCard());
        upperTrickPile.addCard(upperDiscardPile.topCard());
        upperTrickPile.addCard(rightDiscardPile.topCard());
        upperTrickPile.addCard(lowerDiscardPile.topCard());
        upperDiscardPile.render();
        rightDiscardPile.render();
        lowerDiscardPile.render();
        leftDiscardPile.render();
        upperTrickPile.render();
    }else if (data.user === players.right){
        rightTrickPile.addCard(leftDiscardPile.topCard());
        rightTrickPile.addCard(upperDiscardPile.topCard());
        rightTrickPile.addCard(rightDiscardPile.topCard());
        rightTrickPile.addCard(lowerDiscardPile.topCard());
        rightDiscardPile.render();
        lowerDiscardPile.render();
        leftDiscardPile.render();
        upperDiscardPile.render();
        rightTrickPile.render();
    }else if (data.user === user){
        lowerTrickPile.addCard(leftDiscardPile.topCard());
        lowerTrickPile.addCard(upperDiscardPile.topCard());
        lowerTrickPile.addCard(rightDiscardPile.topCard());
        lowerTrickPile.addCard(lowerDiscardPile.topCard());
        lowerDiscardPile.render();
        leftDiscardPile.render();
        upperDiscardPile.render();
        rightDiscardPile.render();
        lowerTrickPile.render();
    }else {
        window.alert("Error: Invalid user for trick-won");
    }
});



   