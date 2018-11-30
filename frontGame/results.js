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