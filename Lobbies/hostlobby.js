// Connects to sockets backend in the /lobbies namespace
let socket = io('http://localhost:8080/lobbies');
let table = document.getElementById('table');
let lobbyname = localStorage.getItem('lobbyname');
let startgamebtn = document.getElementById('startgamebtn');
let p1 = document.getElementById('player1');
let p2 = document.getElementById('player2');
let p3 = document.getElementById('player3');
let p4 = document.getElementById('player4');
let username = "";

firebase.auth().onAuthStateChanged( user => {
    if (user) 
    { 
    var query = firebase.database().ref("users/" + user.uid);
    query.once("value")
      .then(function(snapshot) {
        username = snapshot.child("username").val();
        p1.innerHTML = username;
      });
    }
    else {
        console.log("User not signed in");
    }
  });

startgamebtn.addEventListener('click', e=> {
    socket.emit('start-game', {lobbyname: lobbyname})
});

socket.on('game-started', data => {
    if(data.lobbyname == lobbyname){
        window.location.href = "frontGame.html";
    }
});

socket.on('lobby-updated', lobbyData => {
    // Code to update lobby on screen
    if(lobbyData.name == lobbyname){
        var i;
        for(i = 0; i < lobbyData.players.length; i++){
            if(i == 0){
                p1.innerHTML = lobbyData.players[i];
            }
            else if(i == 1){
                p2.innerHTML = lobbyData.players[i];
            }
            else if(i == 2){
                p3.innerHTML = lobbyData.players[i];
            }
            else if(i == 3){
                p4.innerHTML = lobbyData.players[i];
            }
        }
        if(lobbyData.players.length == 4){
            startgamebtn.disabled = false;
        }
    }
});

