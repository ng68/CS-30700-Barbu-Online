let socket = io('https://protected-reef-35837.herokuapp.com/home');
//let socket = io('http://localhost:8080/home');
var addFriend = document.getElementById("addFriend");
//var removeFriend = document.getElementById("removeFriend");
var addFriendBtn = document.getElementById("addFriendBtn");
var removeFriendBtn = document.getElementById("removeFriendBtn");
var sendMessageBtn = document.getElementById("send-message-btn");
var messageInput = document.getElementById("message-input");
var messageBox = document.getElementById("messages");
var friendList = document.getElementById("friend-list");
let email;

firebase.auth().onAuthStateChanged( user => {
    if (user) 
    {
        email = user.email;
        socket.emit('user-info', {
            uid: user.uid
        });
    }
});

function sendChat() {
    socket.emit('chat-sent', { // TODO fill in username correctly
        username: email,
        message: messageInput.value
    });

    messageInput.value = '';
}

socket.on('new-message', data => {
    console.log("Here");
    let messageDiv = document.createElement("div");
    let messageString = data.username + ": " + data.message;
    messageDiv.innerHTML = messageString;

    messageBox.appendChild(messageDiv);
    messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
});

socket.on('connected-user', data => {
    // the uid is accessed in data.uid
    //if (data.uid is in the users' friends list) {
        // Mark the user data.uid as online
    //}
});

socket.on('disconnected-user', data => {
    // again the user id is stored in data.uid
    //if (data.uid is in friends list) {
        // mark them as offline
    //}
});

/*
window.addEventListener("beforeunload", function(e){
    window.alert("HELLO");
 }, false);
*/

addFriendBtn.addEventListener('click', e=> {
    //e.preventDefault();
    var query = firebase.database().ref("users");
    var friend = document.getElementById("addFriend").value;
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var email = childSnapshot.child("email").val();
          if (email === friend && firebase.auth().currentUser.email != friend) {
             var username = childSnapshot.child("username").val();
             var uid = childSnapshot.key;
             firebase.database().ref().child("users").child(firebase.auth().currentUser.uid).child("friends").child(uid).update({email : email});
             friendsList();
             return true;
          }
      });
    });
	document.getElementById("addFriend").value = '';
});

removeFriendBtn.addEventListener('click', e=> {
    //e.preventDefault();
    let friend = removeFriend.value;
    var query = firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/friends");
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var email = childSnapshot.child("email").val();
          if (email === friend) {
              let uid = childSnapshot.key;
              var query2 = firebase.database().ref("users/" + uid + "/friends");
                query2.once("value")
                .then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                    var email = childSnapshot.child("email").val();
                    if (email === firebase.auth().currentUser.email) {
                        query2.child(childSnapshot.key).remove();
                    }
                });
                });
              query.child(childSnapshot.key).remove();
              friendsList();
          }
      });
    });
	document.getElementById("removeFriend").value = '';
});

function friendsList(){
    friendList.innerHTML = "";
    firebase.auth().onAuthStateChanged(function(user){
        var query = firebase.database().ref("users/" + user.uid + "/friends");
        query.once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
            var email = childSnapshot.child("email").val();
            document.getElementById("removeFriend").innerHTML += "<option value=\"" + email + "\">" + email + "</option>";
            let messageDiv = document.createElement("div");
            messageDiv.innerHTML = email;
            friendList.appendChild(messageDiv);
            });
        });
    });
}

// JS for top 5 players
var str = '';
var users = [];
firebase.database().ref("users").orderByChild("avg_score").on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        users.push([childSnapshot.val().username, childSnapshot.val().wins, childSnapshot.val().avg_score]);
    });
    users.sort(sort_function);
    var top5 = users.slice(0, 5);
    for(var i = 0; i < top5.length; i++) {
	    str += '<tr>\n<td>' + (i+1) + '</td>\n';
	    str += '<td>' + top5[i][0] + '</td>\n';
	    str += '</tr>\n';
    }
    document.getElementById("table").innerHTML += str;
});


function sort_function(a, b) {
    if(a[2] == b[2]) {
        return 0;
    }
    else if(a[2] > b[2]) {
        return -1;
    }
    else {
        return 1;
    }
}

friendsList();
