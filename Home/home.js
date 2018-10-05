var addFriend = document.getElementById("addFriend");
var removeFriend = document.getElementById("removeFriend");
var addFriendBtn = document.getElementById("addFriendBtn");
var removeFriendBtn = document.getElementById("removeFriendBtn");

addFriendBtn.addEventListener('click', e=> {
    window.alert("Hello!");
    var query = firebase.database().ref("users");
    query.once("value")
        .then(function(snapshot){
            window.alert("HEH");
        });
});
