// Connects to sockets backend in the /lobbies namespace
let socket = io('https://protected-reef-35837.herokuapp.com/lobbies');
let lobbyNameInput = document.getElementById('lobby-name');
let passwordInput = document.getElementById('lobby-password');
let checkPass = document.getElementById('check-password');
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

socket.emit('user-info', {
    uid: firebase.auth().currentUser.uid
});

function makelobby() {
    // emits that a lobby is created
    if(lobbyNameInput.value == ""){
        alert("Please enter a name for your lobby.");
    }
    else {
        localStorage.setItem('lobbyname', lobbyNameInput.value);
        localStorage.setItem('lobbyowner', username);
        let radios = document.getElementsByName('pub_difficulty');
        let diff = "";
        for (var i = 0; i < radios.length; i++) {
            if(radios[i].checked){
                diff = radios[i].value;
            }
        }
        let e = document.getElementById('pub_num_rounds');
        let rounds = e.options[e.selectedIndex].text;
        socket.emit('lobby-created', {
            owner: username,
            name: lobbyNameInput.value,
            password: "",
            num_rounds: rounds,
            difficulty: diff
        });
    }
}

function makeprivatelobby() {
    // emits that a lobby is created
    let privateLobbyName = document.getElementById('private-lobby-name');
    if(privateLobbyName.value == ""){
        alert("Please enter a name for your lobby.");
    }
    if(passwordInput.value == ""){
        alert("Please enter a password for your lobby.");
    }
    
    else {
        localStorage.setItem('lobbyname', privateLobbyName.value);
        localStorage.setItem('lobbyowner', username);
        let radios = document.getElementsByName('pub_difficulty');
        let diff = "";
        for (var i = 0; i < radios.length; i++) {
            if(radios[i].checked){
                diff = radios[i].value;
            }
        }
        let e = document.getElementById('pub_num_rounds');
        let rounds = e.options[e.selectedIndex].text;
        socket.emit('lobby-created', {
            owner: username,
            name: privateLobbyName.value,
            password: passwordInput.value,
            num_rounds: rounds,
            difficulty: diff
        });
    }
    //window.location.href = "hostlobby.html";
}

function checkPassword() {
    socket.emit('check-password', {
        lobbyName: localStorage.getItem('lobbyname'),
        password: checkPass.value
    });
}
socket.on('password-accepted', data => {
    socket.emit('join-lobby', {
        lobbyName: localStorage.getItem("lobbyname"),
        user: username
    });
});

socket.on('password-denied', data => {
    alert("Invalid Password");
});

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
    row.setAttribute('id', lobbyData.name);
    let td1 = document.createElement('td');
    // Create a button that sends info to the server for a player to join
    // the lobby that the button is attached to.
    let btn = document.createElement('button');
    btn.setAttribute('class', "btn btn-primary btn-sm m-0")

    btn.appendChild(document.createTextNode('Join Lobby'));
    if(lobbyData.password == ""){
        btn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('lobbyname', lobbyData.name);
            localStorage.setItem('lobbyowner', lobbyData.owner);
            socket.emit('join-lobby', {
                lobbyName: lobbyData.name,
                user: username
            });
        });
    }
    else {
        btn.setAttribute('data-toggle', "modal");
        btn.setAttribute('data-target', "#myModal2");
        btn.addEventListener('click', e => {
            e.preventDefault();
            localStorage.setItem('lobbyname', lobbyData.name);
        });
    }
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
    let td5 = document.createElement('td');
    if(lobbyData.password == ""){
        td5.appendChild(document.createTextNode("No"));
    }
    else {
        td5.appendChild(document.createTextNode("Yes"));
    }
    row.appendChild(td5);
    let td6 = document.createElement('td');
    td6.appendChild(document.createTextNode(lobbyData.difficulty));
    row.appendChild(td6);
    let td7 = document.createElement('td');
    td7.appendChild(document.createTextNode(lobbyData.num_rounds));
    row.appendChild(td7);
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

socket.on('lobby-removed', lobbyData => {
    // Code to update lobby on screen
    let lobby = document.getElementById(lobbyData.lobbyName);
    lobby.parentElement.removeChild(lobby);
});