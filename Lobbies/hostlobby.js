// Connects to sockets backend in the /lobbies namespace
let socket = io('https://protected-reef-35837.herokuapp.com/lobbies');
let table = document.getElementById('table');
let lobbyname = localStorage.getItem('lobbyname');
let startgamebtn = document.getElementById('startgamebtn');
let disbandlobbybtn = document.getElementById('disbandlobbybtn');
let p1 = document.getElementById('player1');
let p2 = document.getElementById('player2');
let p3 = document.getElementById('player3');
let p4 = document.getElementById('player4');
let kickP2 = document.getElementById('kickP2');
let kickP3 = document.getElementById('kickP3');
let kickP4 = document.getElementById('kickP4');
let kickAll = document.getElementById('kickAll');
let username = "";

firebase.auth().onAuthStateChanged( user => {
    if (user) 
    {
    socket.emit('user-info', {
        uid: user.uid
    });
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
    socket.emit('start-game', {lobbyName: lobbyname});
});
disbandlobbybtn.addEventListener('click', e=> {
    socket.emit('disband-lobby', {lobbyName: lobbyname});
    localStorage.clear();
    window.location.href = "lobbies.html";
});

socket.on('game-started', data => {
    if(data.lobbyName == lobbyname){
        window.location.href = "frontGame.html";
    }
});

kickAll.addEventListener('click', e=> {
    if(p2.innerHTML != "Waiting for player..."){
        socket.emit('leave-lobby', {
            lobbyName: lobbyname,
            user: p2.innerHTML
        });
    }
    if(p3.innerHTML != "Waiting for player..."){
        socket.emit('leave-lobby', {
            lobbyName: lobbyname,
            user: p3.innerHTML
        });
    }
    if(p4.innerHTML != "Waiting for player..."){
        socket.emit('leave-lobby', {
            lobbyName: lobbyname,
            user: p4.innerHTML
        });
    }
});

kickP2.addEventListener('click', e=> {
    socket.emit('leave-lobby', {
        lobbyName: lobbyname,
        user: p2.innerHTML
    });
});

kickP3.addEventListener('click', e=> {
    socket.emit('leave-lobby', {
        lobbyName: lobbyname,
        user: p3.innerHTML
    });
});

kickP4.addEventListener('click', e=> {
    socket.emit('leave-lobby', {
        lobbyName: lobbyname,
        user: p4.innerHTML
    });
});

socket.on('lobby-updated', lobbyData => {
    // Code to update lobby on screen
    if(lobbyData.name == lobbyname){
        var i;
        for(i = 0; i < lobbyData.players.length; i++){
            if(i == 0){
                p1.innerHTML = lobbyData.players[i];
                p2.innerHTML = "Waiting for player...";
                kickP2.disabled = true;
                p3.innerHTML = "Waiting for player...";
                kickP3.disabled = true;
                p4.innerHTML = "Waiting for player...";
                kickP4.disabled = true;
            }
            else if(i == 1){
                p2.innerHTML = lobbyData.players[i];
                kickP2.disabled = false;
                p3.innerHTML = "Waiting for player...";
                kickP3.disabled = true;
                p4.innerHTML = "Waiting for player...";
                kickP4.disabled = true;
            }
            else if(i == 2){
                p3.innerHTML = lobbyData.players[i];
                kickP3.disabled = false;
                p4.innerHTML = "Waiting for player...";
                kickP4.disabled = true;
            }
            else if(i == 3){
                p4.innerHTML = lobbyData.players[i];
                kickP4.disabled = false;
            }
        }
        if(lobbyData.players.length == 4){
            startgamebtn.disabled = false;
        }
        else {
            startgamebtn.disabled = true;
        }
    }
});

