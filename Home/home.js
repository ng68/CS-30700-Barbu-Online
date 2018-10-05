var addFriend = document.getElementById("addFriend");
var removeFriend = document.getElementById("removeFriend");
var addFriendBtn = document.getElementById("addFriendBtn");
var removeFriendBtn = document.getElementById("removeFriendBtn");

addFriendBtn.addEventListener('click', e=> {
    var query = firebase.database().ref("users").orderByKey();
    query.once("value")
        .then(function(snapshot) {
            snapshot.foreach(function(childSnapshot) {
                var tempEmail = childSnapshot.child("email");
                window.alert(tempEmail);
                if (tempEmail == addFriend) {
                    window.alert("SUCCESS!!!!");
                    return true;
                }
            })
        })
})
