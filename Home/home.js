var addFriend = document.getElementById("addFriend");
var removeFriend = document.getElementById("removeFriend");
var addFriendBtn = document.getElementById("addFriendBtn");
var removeFriendBtn = document.getElementById("removeFriendBtn");
var sendMessageBtn = document.getElementById("send-message-btn");
var messageInput = document.getElementById("message-input");
var messages = document.getElementById("messages");
var friendList = document.getElementById("friend-list");

addFriendBtn.addEventListener('click', e=> {
    e.preventDefault();
	
    var query = firebase.database().ref("users");
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var email = childSnapshot.child("email").val();
          if (email == addFriend.value && firebase.auth().currentUser.email != addFriend.value) {
             var username = childSnapshot.child("username").val();
             var uid = childSnapshot.key;
             firebase.database().ref().child("users").child(firebase.auth().currentUser.uid).child("friends").child(uid).update({email : email});
             friendsList();
             document.getElementById("addFriend").value = "";        
             return true;
          }
      });
    });
    
});

removeFriendBtn.addEventListener('click', e=> {
    e.preventDefault();
	
    var query = firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/friends");
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var email = childSnapshot.child("email").val();
          if (email == removeFriend.value) {
              query.child(childSnapshot.key).remove();
              friendsList();
              document.getElementById("removeFriend").value = "";
              return true;
          }
      });
    });
    
});

function friendsList(){
    friendList.innerHTML = "";
    firebase.auth().onAuthStateChanged(function(user){
        var query = firebase.database().ref("users/" + user.uid + "/friends");
        query.once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
            var email = childSnapshot.child("email").val();
            let messageDiv = document.createElement("div");
            messageDiv.innerHTML = email;
            friendList.appendChild(messageDiv);
            });
        });
    });
}

sendMessageBtn.addEventListener('click', e => {
    e.preventDefault();
    let text = messageInput.value;
    let userEmail = firebase.auth().currentUser.email;

	document.getElementById("message-input").value = "";
    firebase.database().ref('/messages/').push({
        user: userEmail,
        content: text
    });
});

function loadMessages() {
    var callback = function(snap) {
        var data = snap.val();
        addMessage(data.user, data.content);
    }

    firebase.database().ref('/messages/').limitToLast(9).on('child_added', callback);
    firebase.database().ref('/messages/').limitToLast(9).on('child_changed', callback);
}

function addMessage(username, messageContent) {
    let messageDiv = document.createElement("div");
    let messageString = username + ": " + messageContent;
    messageDiv.innerHTML = messageString;

    messages.appendChild(messageDiv);
}

loadMessages();
friendsList();