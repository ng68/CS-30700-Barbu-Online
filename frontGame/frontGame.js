let socket = io('https://protected-reef-35837.herokuapp.com/games'); //Socket
let lobby = localStorage.getItem('lobbyname'); //Lobby currently in 
let user;  //Current User
let subgameList = ["Barbu", "Fan Tan", "Hearts", "Last Two", "Losers", "Queens", "Trumps"];
let players = {};   //Players in your lobby (Left, Top, Right)
let currentDealer = 0;
let currentSubgame;
let myTurn = false;  //Current user position relative to other players
let lowerhand = new cards.Hand({faceUp:true, x:600, y:500});  //Initializing all of the visuals for hands and discard piles
let lefthand = new cards.Hand({faceUp:false, x:200, y:270});
let upperhand = new cards.Hand({faceUp:false, x:600, y:80});	
let righthand = new cards.Hand({faceUp:false, x:1000, y:270});
let lowerDiscardPile = new cards.Deck({faceUp:true, x:600, y:320});
let upperDiscardPile = new cards.Deck({faceUp:true, x:600, y:220});
let leftDiscardPile = new cards.Deck({faceUp:true, x:520, y:270});
let rightDiscardPile = new cards.Deck({faceUp:true, x:680, y:270});
let lowerTrickPile = new cards.Deck({faceUp:false, x:850, y:500});
let upperTrickPile = new cards.Deck({faceUp:false, x:350, y:80});
let leftTrickPile = new cards.Deck({faceUp:false, x:200, y:150});
let rightTrickPile = new cards.Deck({faceUp:false, x:1000, y:390});
let loc = {};  //Keeps track of the reference to the location of each Card

firebase.auth().onAuthStateChanged( user => {
    if (user) 
    { 
    var query = firebase.database().ref("users/" + user.uid);
    query.once("value")
      .then(function(snapshot) {
        user = snapshot.child("username").val();
        socket.emit('player-info', {
            username : user,
            lobbyname : lobby
        });
      });
    }
    else {
        console.log("User not signed in");
    }
  });
/*
socket.on('player-joined', data => {
    befPlayers = data.username;
    host = befPlayers[0];
    if (befPlayers.length === 4 && host === user) {
        testerBtn.style.visibility = 'visible';
    }
});
*/

/*document.getElementById("p1").addEventListener('click', e => {
    user = "p1";
    socket.emit('player-info', {
        username : user,
        lobbyname : lobby
    });
});

document.getElementById("p2").addEventListener('click', e => {
    user = "p2";
    socket.emit('player-info', {
        username : user,
        lobbyname : lobby
    });
});

document.getElementById("p3").addEventListener('click', e => {
    user = "p3";
    socket.emit('player-info', {
        username : user,
        lobbyname : lobby
    });
});

document.getElementById("p4").addEventListener('click', e => {
    user = "p4";
    socket.emit('player-info', {
        username : user,
        lobbyname : lobby
    });
});

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
//socket.on('start-game', data => {
   
    //socket.emit('confirmation', {
    //    lobbyname : lobby
    //});
//});

//Run this for each subgame that we run this also populates the hands.
socket.on('cards-dealt', data => {
    console.log(data);
    for (var i = 0; i < 4;i++) {
        if (Object.keys(data)[i] === user) {
            myPosition = i;
            players = {
                left: Object.keys(data)[(i+1)%4],
                top: Object.keys(data)[(i+2)%4],
                right: Object.keys(data)[(i+3)%4]
            };
            document.getElementById("player1").innerHTML = user;
            document.getElementById("player1score").innerHTML = data.scores[myPosition];
            document.getElementById("player2").innerHTML = players.left;
            document.getElementById("player2score").innerHTML = data.scores[(myPosition+1)%4];
            document.getElementById("player3").innerHTML = players.top;
            document.getElementById("player3score").innerHTML = data.scores[(myPosition+2)%4];
            document.getElementById("player4").innerHTML = players.right;
            document.getElementById("player4score").innerHTML = data.scores[(myPosition+3)%4]; 
        }
    }
    $('.card').remove();  //Initializing all of the visuals for hands and discard piles
    var dealDeck = [];
    currentDealer = data.dealer;
    document.getElementById("dealer").innerHTML = currentDealer;
    for(var i = 0; i < data[user].length; i++) {
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
    deck.deal(13, [lowerhand, lefthand, upperhand, righthand], 10);
    //prompt with subgame choice if dealer
    if (user === currentDealer) {
        let temp = "";
        for (var i = 0; i < subgameList.length; i++) {
            temp += "<input type=\"radio\" name=\"subgame\" value=\"" + subgameList[i] + "\"> " + subgameList[i] + "<br>";
        }
        document.getElementById("radio-home").innerHTML = temp;
        //Bring up subgame prompt
        document.getElementById("cSubgame").style.visibility = 'visible';
        document.getElementById("trump").style.visibility = 'hidden';
        //button hide
        $('#myModal').modal('show');
    }else {
        //Waiting prompt
        $('#waitingModal').modal('show');
    }
});

function chooseTrump(){
    let cTrump = document.querySelector('input[name = "trump"]:checked').value;
    socket.emit('subgame-chosen', {
        lobbyname : lobby, 
        gamechoice : currentSubgame,
        username : user,
        trump : cTrump
    });
    $('#myModal').modal('hide');
    for(var i = 0; i < subgameList.length; i++){ 
        if (subgameList[i] === currentSubgame) {
          subgameList.splice(i, 1); 
        }
     }
}

function chooseSubgame (){
    if ($('input[name=subgame]:checked').length > 0) {
        // do something here
        let chosen = document.querySelector('input[name = "subgame"]:checked').value;
        currentSubgame = chosen;
        if (chosen === "Trumps") {
            let temp = "";
            temp += "<input type=\"radio\" name=\"trump\" value= \"c\">Clubs<br>";
            temp += "<input type=\"radio\" name=\"trump\" value= \"d\">Diamonds<br>";
            temp += "<input type=\"radio\" name=\"trump\" value= \"h\">Hearts<br>";
            temp += "<input type=\"radio\" name=\"trump\" value= \"s\">Spades<br>";
            document.getElementById("radio-home").innerHTML = temp;
            document.getElementById("cSubgame").style.visibility = 'hidden';
            document.getElementById("trump").style.visibility = 'visible';
            return;
        } 
        socket.emit('subgame-chosen', {
            lobbyname : lobby, 
            gamechoice : chosen,
            username : user,
            trump : ""
        });
        $('#myModal').modal('hide');
        for(var i = 0; i < subgameList.length; i++){ 
            if (subgameList[i] === chosen) {
              subgameList.splice(i, 1); 
            }
         }
    }
    
}

socket.on('subgame-choice', data => {
    $('#waitingModal').modal('hide');
    currentSubgame = data.gamechoice;
    document.getElementById("subgame").innerHTML = currentSubgame;
});

//Ability to click your own hand when it is your turn.
lowerhand.click(function(card){
    if (myTurn) {
        socket.emit('card-chosen', {
            lobbyname : lobby,
            cardValue : card.rank,
            cardSuit : card.suit,
            username : user
        });
    }
});

/*upperhand.click(function(card){
    upperDiscardPile.addCard(card);
	upperDiscardPile.render();
    upperhand.render();
});
*/

/*lefthand.click(function(card){
    leftDiscardPile.addCard(card);
	leftDiscardPile.render();
    lefthand.render();
});
*/

/*righthand.click(function(card){
    rightDiscardPile.addCard(card);
	rightDiscardPile.render();
    righthand.render();
});
*/

socket.on('card-chosen-response', data =>{
    if(data.valid) {
        myTurn = false;
        let tempCard;
        for (var i = 0; i < loc.names.length; i++) {
            if (data.card === loc.names[i]) {
                tempCard = loc.cards[i];
            }
        }
        if (data.username === players.left) {
            leftDiscardPile.addCard(tempCard);
            leftDiscardPile.render();
            lefthand.render();
        }else if (data.username === players.top){
            upperDiscardPile.addCard(tempCard);
            upperDiscardPile.render();
            upperhand.render();
        }else if (data.username === players.right){
            rightDiscardPile.addCard(tempCard);
            rightDiscardPile.render();
            righthand.render();
        }else if (data.username === user){
            lowerDiscardPile.addCard(tempCard);
            lowerDiscardPile.render();
            lowerhand.render();
        }else {
            window.alert("Error: Invalid user for played-card");
        }
    }else {
        if (data.username === user) {
            window.alert(data.error);
        }
    }
});

socket.on('your-turn', data =>{
    document.getElementById("turn").innerHTML = data.username;
    if (data.username === user) {
        myTurn = true;
    }
});

socket.on('game-finished', data => {
    for (var i = 0; i < 4; i++) {
        window.alert(Object.keys(data)[i] + " : " + Object.values(data)[i]);
    }
    window.location.href = "home.html";
});

//socket.on('subgame-finished', data => {
//    //update dealer++%4
//});

socket.on('game-update', data => {
    if (data.username === players.left) {
        leftTrickPile.addCard(leftDiscardPile.topCard());
        leftTrickPile.addCard(upperDiscardPile.topCard());
        leftTrickPile.addCard(rightDiscardPile.topCard());
        leftTrickPile.addCard(lowerDiscardPile.topCard());
        leftDiscardPile.render();
        upperDiscardPile.render();
        rightDiscardPile.render();
        lowerDiscardPile.render();
        leftTrickPile.render();
    }else if (data.username === players.top){
        upperTrickPile.addCard(leftDiscardPile.topCard());
        upperTrickPile.addCard(upperDiscardPile.topCard());
        upperTrickPile.addCard(rightDiscardPile.topCard());
        upperTrickPile.addCard(lowerDiscardPile.topCard());
        upperDiscardPile.render();
        rightDiscardPile.render();
        lowerDiscardPile.render();
        leftDiscardPile.render();
        upperTrickPile.render();
    }else if (data.username === players.right){
        rightTrickPile.addCard(leftDiscardPile.topCard());
        rightTrickPile.addCard(upperDiscardPile.topCard());
        rightTrickPile.addCard(rightDiscardPile.topCard());
        rightTrickPile.addCard(lowerDiscardPile.topCard());
        rightDiscardPile.render();
        lowerDiscardPile.render();
        leftDiscardPile.render();
        upperDiscardPile.render();
        rightTrickPile.render();
    }else if (data.username === user){
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



   