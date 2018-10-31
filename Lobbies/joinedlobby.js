// Connects to sockets backend in the /lobbies namespace
let socket = io('http://localhost:8080/lobbies');
let table = document.getElementById('table');
let lobbyname = localStorage.getItem('lobbyname');
let p1 = document.getElementById('player1');
let p2 = document.getElementById('player2');
let p3 = document.getElementById('player3');
let p4 = document.getElementById('player4');


socket.emit('entered-lobby', lobbyname);

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
                p3.innerHTML = lobbyData.players[i];
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
            }
            else if(i == 1){
                p2.innerHTML = lobbyData.players[i];
            }
            else if(i == 2){
                p3.innerHTML = lobbyData.players[i];
            }
            else if(i == 3){
                p3.innerHTML = lobbyData.players[i];
            }
        }
    }
});