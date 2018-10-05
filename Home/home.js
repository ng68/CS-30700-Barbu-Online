var addFriend = document.getElementById("addFriend");
var removeFriend = document.getElementById("removeFriend");
var addFriendBtn = document.getElementById("addFriendBtn");
var removeFriendBtn = document.getElementById("removeFriendBtn");
var sendMessageBtn = document.getElementById("send-message-btn");
var messageInput = document.getElementById("message-input");
var messages = document.getElementById("messages");

addFriendBtn.addEventListener('click', e=> {
    window.alert("Hello!");
    var query = firebase.database().ref("users");
    query.once("value")
        .then(function(snapshot){
            window.alert("Hi!");
        });
});

sendMessageBtn.addEventListener('click', e => {
    e.preventDefault();
    let text = messageInput.value;
    let userEmail = firebase.auth().currentUser.email;

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