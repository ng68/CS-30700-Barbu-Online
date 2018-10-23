var username = document.getElementById("username");
var email = document.getElementById("email");
var wins = document.getElementById("wins");
var losses = document.getElementById("losses");
var avgscore = document.getElementById("avgscore");
var editbtn = document.getElementById("editbtn");
const auth = firebase.auth();

firebase.auth().onAuthStateChanged( user => {
    if (user) 
    { 
    var query = firebase.database().ref("users/" + user.uid);
    query.once("value")
      .then(function(snapshot) {
        email.innerHTML = snapshot.child("email").val();
        username.innerHTML = snapshot.child("username").val();
        wins.innerHTML = snapshot.child("wins").val();
        losses.innerHTML = snapshot.child("losses").val();
        avgscore.innerHTML = snapshot.child("avg_score").val();
      });
    }
    else {
        console.log("User not signed in");
    }
  });
editbtn.addEventListener('click', e=> {
    window.location.href = "editprofile.html";
});





