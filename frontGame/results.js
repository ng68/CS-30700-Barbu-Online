let socket = io('https://protected-reef-35837.herokuapp.com'); //Socket
let users = localStorage.getItem('users'); //Lobby currently in
let usersScores = localStorage.getItem('usersScores'); //Lobby currently in
let scoreHash = localStorage.getItem('scoreHash'); //Lobby currently in

firebase.auth().onAuthStateChanged(user => {
    if (user)
    {
        socket.emit('user-info', {
            uid: user.uid
        });
    }
});

//Manipulate table
// Add users at the table headers
document.getElementById("player1").innerHTML = users[0];
document.getElementById("player2").innerHTML = users[1];
document.getElementById("player3").innerHTML = users[2];
document.getElementById("player4").innerHTML = users[3];

// Add final scores for players
document.getElementById("player1score").innerHTML = usersScores[0];
document.getElementById("player2score").innerHTML = usersScores[1];
document.getElementById("player3score").innerHTML = usersScores[2];
document.getElementById("player4score").innerHTML = usersScores[3];
