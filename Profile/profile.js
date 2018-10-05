var username = document.getElementById("inputUsername");
var password = document.getElementById("inputPassword");
var confirmPassword = document.getElementById("confirmPassword");
var savebtn = document.getElementById("savebtn");
const auth = firebase.auth();



savebtn.addEventListener('click', e=> {
    if(password.value != confirmPassword.value){
        alert('Confirm Password does not match Password');
    }
    else {
        var user = auth.currentUser;
        user.updatePassword(password.value).catch(function(error) {
            // An error happened.
        });
        firebase.database().ref().child("users").child(user.uid).update({"username" : username.value}, function(error){
            alert("Information Updated Success!");
            window.location.href = "profile.html";
        });
    }
});

