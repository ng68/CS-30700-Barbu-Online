let socket = io('https://protected-reef-35837.herokuapp.com'); //Socket
//let users = localStorage.getItem('users'); //Lobby currently in
//let usersScores = localStorage.getItem('usersScores'); //Lobby currently in
let lobby = localStorage.getItem('lobbyname'); //Lobby currently in

firebase.auth().onAuthStateChanged(user => {
    if (user)
    {
        socket.emit('user-info', {
            uid: user.uid
        });
    }
});

socket.emit('final-results', {
    lobbyname: lobby
});

socket.on('game-result', data =>) {
  let users = data.users;
  let userScores = data.userScores;
  let scoreHash = data.scoreHash;
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

  // Add all round scores
  // row = dealer, subgame, score1, 2, 3, 4
  for(var i = 0; i < scoreHash.length; i++) {
    str += '<tr>\n<td>' + (i+1) + '</td>\n';
    str += '<td>' + scoreHash[i][2] + '</td>\n';
    str += '<td>' + scoreHash[i][3] + '</td>\n';
    str += '<td>' + scoreHash[i][4] + '</td>\n';
    str += '<td>' + scoreHash[i][5] + '</td>\n';
    str += '</tr>\n';
  }
});
