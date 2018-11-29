//let socket = io('http://localhost:8080/games');
let socket = io('https://protected-reef-35837.herokuapp.com/games'); //Socket
//let lobby = "Lobby";//
let lobby = localStorage.getItem('lobbyname'); //Lobby currently in 
let user;  //Current User
let subgameList = ["Barbu", "Fan-Tan", "Hearts", "Last Two", "Losers", "Queens", "Trumps"];
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
let diamondTopDiscardPile = new cards.Deck({faceUp:true, x:495, y:220});
let diamondBottomDiscardPile = new cards.Deck({faceUp:true, x:495, y:320});
let clubTopDiscardPile = new cards.Deck({faceUp:true, x:565, y:220});
let clubBottomDiscardPile = new cards.Deck({faceUp:true, x:565, y:320});
let heartTopDiscardPile = new cards.Deck({faceUp:true, x:635, y:220});
let heartBottomDiscardPile = new cards.Deck({faceUp:true, x:635, y:320});
let spadeTopDiscardPile = new cards.Deck({faceUp:true, x:705, y:220});
let spadeBottomDiscardPile = new cards.Deck({faceUp:true, x:705, y:320});   

let loc = {};  //Keeps track of the reference to the location of each Card

firebase.auth().onAuthStateChanged( usern => {
    if (usern) 
    { 
    var query = firebase.database().ref("users/" + usern.uid);
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
document.getElementById("p1").addEventListener('click', e => {
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
*/
//Run this for each subgame that we run this also populates the hands.
socket.on('cards-dealt', data => {
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
        document.getElementById("exampleModalLabel").innerHTML = "Choose a Subgame";
        let temp = "";
        for (var i = 0; i < subgameList.length; i++) {
            temp += "<input type=\"radio\" name=\"subgame\" value=\"" + subgameList[i] + "\"> " + subgameList[i] + "<br>";
        }
        document.getElementById("radio-home").innerHTML = temp;
        //Bring up subgame prompt
        document.getElementById("cSubgame").style.visibility = 'visible';
        document.getElementById("trump").style.visibility = 'hidden';
        document.getElementById("rank").style.visibility = 'hidden';
        //button hide
        $('#myModal').modal('show');
    }else {
        //Waiting prompt
        document.getElementById("exampleModalLabel2").innerHTML = "Waiting for subgame to be chosen...";
        $('#waitingModal').modal('show');
    }
});

socket.on('request-double', data => {
    if (data.username === user) {
        let posUsers = data.users;
        let redouble = data.redouble;
        let temp = "";
        console.log(posUsers);
        console.log(redouble);
        for (let i = 0; i < posUsers.length;i++) {
            let type = "";
            if (redouble[i]) {
                type = "Re-double";
            }else {
                type = "Double";
            }
            temp += "<input type=\"checkbox\" value=\"" + posUsers[i] + "\" class=\"chk\"> " + type + " " + posUsers[i] + "<br>";
        }
        document.getElementById("check").innerHTML = temp;
        $('#waitingModal').modal('hide');
        $('#doubleModal').modal('show');
    }else {
        //Waiting prompt
        document.getElementById("exampleModalLabel2").innerHTML = "Waiting for doubles to be decided...";
        $('#doubleModal').modal('hide');
        $('#waitingModal').modal('show');
    }
});

function chooseTrump(){
    let cTrump = document.querySelector('input[name = "trump"]:checked').value;
    socket.emit('subgame-chosen', {
        lobbyname : lobby, 
        gamechoice : currentSubgame,
        username : user,
        trump : cTrump,
        rank : ""
    });
    $('#myModal').modal('hide');
    for(var i = 0; i < subgameList.length; i++){ 
        if (subgameList[i] === currentSubgame) {
          subgameList.splice(i, 1); 
        }
     }
}

function chooseRank(){
    let cRank = document.querySelector('input[name = "rank"]:checked').value;
    socket.emit('subgame-chosen', {
        lobbyname : lobby, 
        gamechoice : currentSubgame,
        username : user,
        trump : "",
        rank : cRank
    });
    $('#myModal').modal('hide');
    for(var i = 0; i < subgameList.length; i++){ 
        if (subgameList[i] === currentSubgame) {
          subgameList.splice(i, 1); 
        }
     }
}

function chooseDouble(){
    let chkArray = [];
    $(".chk:checked").each(function() {
		chkArray.push($(this).val());
    });
    socket.emit('double-chosen', {
        lobbyname : lobby, 
        users_doubled : chkArray,
        username : user
    });
}

function chooseSubgame (){
    if ($('input[name=subgame]:checked').length > 0) {
        // do something here
        let chosen = document.querySelector('input[name = "subgame"]:checked').value;
        currentSubgame = chosen;
        if (chosen === "Trumps") {
            document.getElementById("exampleModalLabel").innerHTML = "Choose a Trump";
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
        if (chosen === "Fan-Tan") {
            document.getElementById("exampleModalLabel").innerHTML = "Choose a Rank";
            let temp = "";
            temp += "<input type=\"radio\" name=\"rank\" value=2>2<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=3>3<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=4>4<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=5>5<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=6>6<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=7>7<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=8>8<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=9>9<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=10>10<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=11>Jack<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=12>Queen<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=13>King<br>";
            temp += "<input type=\"radio\" name=\"rank\" value=14>Ace<br>";
            document.getElementById("radio-home").innerHTML = temp;
            document.getElementById("cSubgame").style.visibility = 'hidden';
            document.getElementById("rank").style.visibility = 'visible';
            return;
        }
        socket.emit('subgame-chosen', {
            lobbyname : lobby, 
            gamechoice : chosen,
            username : user,
            trump : "",
            rank : ""
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
    currentSubgame = data.gamechoice;
    if (currentSubgame === "Trumps") {
        document.getElementById("subgame").innerHTML = currentSubgame + " (" + data.trump + ")";
    }else if (currentSubgame === "Fan-Tan") {
        document.getElementById("subgame").innerHTML = currentSubgame + " (" + data.rank + ")";
    }else {
        document.getElementById("subgame").innerHTML = currentSubgame;
    }
});

socket.on('double-choices', data => {
    $('#doubleModal').modal('hide');
    $('#waitingModal').modal('hide');
    let players = data.players;
    let doubles = data.doubles;
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

function checkWhichPile(initialRank, card, hand, single_suit, tempCard) {
    let suit = card.substring(0,1);
    let rank = parseInt(card.substring(1),10);
    initialRank = parseInt(initialRank,10);
    let pile;
    if (suit === "s") {
        if (rank >= initialRank) {
            pile = 4;
        }else {
            pile = 8;
        }
    }else if (suit === "c") {
        if (rank >= initialRank) {
            pile = 2;
        }else {
            pile = 6;
        }
    }else if (suit === "h") {
        if (rank >= initialRank) {
            pile = 3;
        }else {
            pile = 7;
        }
    }else if (suit === "d") {
        if (rank >= initialRank) {
            pile = 1;
        }else {
            pile = 5;
        }
    }else {
        console.log("Unknown suit for Fan Tan");
    }
    switch(pile) {
        case 1:
            if(single_suit[0]) {
                diamondBottomDiscardPile.addCard(diamondTopDiscardPile.topCard());
                diamondBottomDiscardPile.render();
                diamondTopDiscardPile.render();
            }
            diamondTopDiscardPile.addCard(tempCard);
            diamondTopDiscardPile.render();
            hand.render();
            break;

        case 2:
            if(single_suit[1]) {
                clubBottomDiscardPile.addCard(clubTopDiscardPile.topCard());
                clubBottomDiscardPile.render();
                clubTopDiscardPile.render();
            }
            clubTopDiscardPile.addCard(tempCard);
            clubTopDiscardPile.render();
            hand.render();
            break;

        case 3:
            if(single_suit[2]) {
                heartBottomDiscardPile.addCard(heartTopDiscardPile.topCard());
                heartBottomDiscardPile.render();
                heartTopDiscardPile.render();
            }
            heartTopDiscardPile.addCard(tempCard);
            heartTopDiscardPile.render();
            hand.render();
            break;

        case 4:
            if(single_suit[3]) {
                spadeBottomDiscardPile.addCard(spadeTopDiscardPile.topCard());
                spadeBottomDiscardPile.render();
                spadeTopDiscardPile.render();
            }
            spadeTopDiscardPile.addCard(tempCard);
            spadeTopDiscardPile.render();
            hand.render();
            break;

        case 5:
            diamondBottomDiscardPile.addCard(tempCard);
            diamondBottomDiscardPile.render();
            hand.render();
            break;
        case 6:
            clubBottomDiscardPile.addCard(tempCard);
            clubBottomDiscardPile.render();
            hand.render();
            break;
        case 7:
            heartBottomDiscardPile.addCard(tempCard);
            heartBottomDiscardPile.render();
            hand.render();
            break;
        case 8: 
            spadeBottomDiscardPile.addCard(tempCard);
            spadeBottomDiscardPile.render();
            hand.render();
            break;
        
    }
}

socket.on('card-chosen-response-ft', data =>{
    if(data.valid) {
        myTurn = false;
        let tempCard;
        for (var i = 0; i < loc.names.length; i++) {
            if (data.card === loc.names[i]) {
                tempCard = loc.cards[i];
            }
        }
        if (data.username === players.left) {
            checkWhichPile(data.start_card, data.card, lefthand, data.single_suit, tempCard);
        }else if (data.username === players.top){
            checkWhichPile(data.start_card, data.card, upperhand, data.single_suit, tempCard);
        }else if (data.username === players.right){
            checkWhichPile(data.start_card, data.card, righthand, data.single_suit, tempCard);
        }else if (data.username === user){
            checkWhichPile(data.start_card, data.card, lowerhand, data.single_suit, tempCard);
        }else {
            window.alert("Error: Invalid user for played-card (Fan-Tan)");
        }
    }else {
        if (data.username === user) {
            window.alert(data.error);
        }
    }
});

socket.on('your-turn', data =>{
    $('#doubleModal').modal('hide');
    $('#waitingModal').modal('hide');
    document.getElementById("turn").innerHTML = data.username;
    if (data.username === user) {
        myTurn = true;
    }
});

socket.on('game-finished', data => {
    var msg = "";
    for (var i = 0; i < 4; i++) {
        msg = msg +  Object.keys(data)[i] + " : " + Object.values(data)[i][0] + "\n";
        firebase.auth().onAuthStateChanged(function(user){   
            var query = firebase.database().ref("users/" + user.uid);
            query.on("value", function(snapshot) {
                let totalScore = snapshot.val().avg_score;
                let wins = snapshot.val().wins;
                let losses = snapshot.val().losses;
                if (user = snapshot.child("username")) {
                    if (Object.values(data)[i][1]) {
                        totalScore = totalScore + Object.values(data)[i][0];
                        wins = wins + 1;
                    }else {
                        totalScore = totalScore + Object.values(data)[i][0];
                        losses = losses + 1;
                    }
                    firebase.database().ref("users/" + user.uid).update({
                        wins : wins,
                        losses : losses,
                        avg_score: totalScore
                    });
                }
            });
        });   
    }
    window.alert(msg);
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



   