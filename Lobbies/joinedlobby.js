// Connects to sockets backend in the /lobbies namespace
const socket = io('https://protected-reef-35837.herokuapp.com/lobbies');
let table = document.getElementById('table');
let lobbyname = localStorage.getItem('lobbyname');
let leavelobbybtn = document.getElementById('leavelobbybtn');
let p1 = document.getElementById('player1');
let p2 = document.getElementById('player2');
let p3 = document.getElementById('player3');
let p4 = document.getElementById('player4');
let username = "";

if (window.performance) {
}
  if (performance.navigation.type == 1) {
       window.localStorage
  } 
firebase.auth().onAuthStateChanged( user => {
    if (user) 
    { 
    var query = firebase.database().ref("users/" + user.uid);
    query.once("value")
      .then(function(snapshot) {
        username = snapshot.child("username").val();
      });
    }
    else {
        console.log("User not signed in");
    }
  });

socket.emit('user-info', {
    uid: firebase.auth().currentUser.uid
});

socket.emit('entered-lobby', lobbyname);

leavelobbybtn.addEventListener('click', e=> {
    socket.emit('leave-lobby', {
        lobbyName: lobbyname,
        user: username
    });
    localStorage.clear();
    window.location.href = "lobbies.html";
});

socket.on('lobby-updated', lobbyData => {
    // Code to update lobby on screen
    if(lobbyData.name == lobbyname){
        var i;
        for(i = 0; i < lobbyData.players.length; i++){
            if(!lobbyData.players.includes(username)){
                window.location.href = "lobbies.html";
            }
            if(i == 0){
                p1.innerHTML = lobbyData.players[i];
                p2.innerHTML = "Waiting for player...";
                p3.innerHTML = "Waiting for player...";
                p4.innerHTML = "Waiting for player...";
            }
            else if(i == 1){
                p2.innerHTML = lobbyData.players[i];
                p3.innerHTML = "Waiting for player...";
                p4.innerHTML = "Waiting for player...";
            }
            else if(i == 2){
                p3.innerHTML = lobbyData.players[i];
                p4.innerHTML = "Waiting for player...";
            }
            else if(i == 3){
                p4.innerHTML = lobbyData.players[i];
            }
        }
    }
});

socket.on('entered-lobby-response', lobbyData => {
    // Code to update lobby on screen
    if(lobbyData.name == lobbyname){
        var i;
        for(i = 0; i < lobbyData.players.length; i++){
            if(i == 0){
                p1.innerHTML = lobbyData.players[i];
                p2.innerHTML = "Waiting for player...";
                p3.innerHTML = "Waiting for player...";
                p4.innerHTML = "Waiting for player...";
            }
            else if(i == 1){
                p2.innerHTML = lobbyData.players[i];
                p3.innerHTML = "Waiting for player...";
                p4.innerHTML = "Waiting for player...";
            }
            else if(i == 2){
                p3.innerHTML = lobbyData.players[i];
                p4.innerHTML = "Waiting for player...";
            }
            else if(i == 3){
                p4.innerHTML = lobbyData.players[i];
            }
        }
    }
});

socket.on('game-started', data => {
    if(data.lobbyName == lobbyname){
        window.location.href = "frontGame.html";
    }
});
socket.on('lobby-removed', lobbyData => {
    // Code to update lobby on screen
    if (lobbyData.name == lobbyname){
        if (lobbyData.kickClients) {
            window.location.href = "lobbies.html";
        }
    }
});