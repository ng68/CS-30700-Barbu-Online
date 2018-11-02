// Connects to sockets backend in the /lobbies namespace
let socket = io('https://protected-reef-35837.herokuapp.com/lobbies');
let lobbyNameInput = document.getElementById('lobby-name');
let table = document.getElementById('table');
let username = "";

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

function makelobby() {
    // emits that a lobby is created
    localStorage.setItem('lobbyname', lobbyNameInput.value);
    localStorage.setItem('lobbyowner', username);
    socket.emit('lobby-created', {
        owner: username,
        name: lobbyNameInput.value
    });
    //window.location.href = "hostlobby.html";
}

// Response handler for creating the lobby
socket.on('lobby-created-response', data => {
    console.log(data);
    if(data == "OK"){
        window.location.href = "hostlobby.html";
    }
    else {
        alert("Error: Cannot create lobby - Owner already has lobby or Lobby name already exists");
    }
});
// When a new lobby is created, this code executes.
// The code also executes when the lobbies page first loads
// one time for each pre-existing lobby.
// lobbyData is expected to be of the form: {
//    owner: String,
//    name: String,
//    players: []
// }
socket.on('new-lobby', lobbyData => {
    // Basic string representation of the lobby
    //let string = lobbyData.name + " created by " + lobbyData.owner + ". Players:"
    //lobbyData.players.forEach(user => {
    //    string += " ";
    //    string += user;
    //});
    // Create a new list element, append the string to it
    let row = document.createElement('tr');
    let td1 = document.createElement('td');
    // Create a button that sends info to the server for a player to join
    // the lobby that the button is attached to.
    let btn = document.createElement('button');
    btn.setAttribute('class', "btn btn-primary btn-sm m-0")

    btn.appendChild(document.createTextNode('Join Lobby'));
    btn.addEventListener('click', e => {
        e.preventDefault();
        localStorage.setItem('lobbyname', lobbyData.name);
        localStorage.setItem('lobbyowner', lobbyData.owner);
        socket.emit('join-lobby', {
            lobbyName: lobbyData.name,
            user: username
        });
    });
    
    td1.appendChild(btn);
    row.appendChild(td1);
    let td2 = document.createElement('td');
    td2.appendChild(document.createTextNode(lobbyData.name));
    row.appendChild(td2);
    let td3 = document.createElement('td');
    td3.appendChild(document.createTextNode(lobbyData.owner));
    row.appendChild(td3);
    let td4 = document.createElement('td');
    td4.appendChild(document.createTextNode(lobbyData.players.length + "/4"));
    td4.setAttribute('id', lobbyData.owner);
    row.appendChild(td4);
    table.appendChild(row);
    //li.appendChild(btn); // Append button to the li
    //lobbiesUL.appendChild(li);
});
// Response handler for joining a lobby
socket.on('join-lobby-response', data => {
    if(data == "OK"){
        window.location.href = "joinedlobby.html";
    }
    else {
        alert("Could not join lobby - Lobby is full");
    }
    console.log(data);
});
// When a lobby is updated (e.g. a player joins), this
// code will execute on all clients.
// lobbyData is expected to be of the form: {
//    owner: String,
//    name: String,
//    players: []
// }
socket.on('lobby-updated', lobbyData => {
    // Code to update lobby on screen
    let playercount = document.getElementById(lobbyData.owner);
    playercount.innerHTML = lobbyData.players.length + "/4";
});