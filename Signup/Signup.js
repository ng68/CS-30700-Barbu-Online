var registerbtn = document.getElementById("registerbtn");
var username = document.getElementById("inputEmail");
var password = document.getElementById("inputPassword");

registerbtn.addEventListener('click', e=> {
    const user = username.value;
    const pass = password.value;
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(user,pass).catch(function(error){
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === 'auth/invalid-email'){
            alert('Invalid Email');
        }
        else {
            alert(errorMessage);
        }
    });
});
firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            console.log('Success!');

            //Initializing the user info in Firebase databasea
            var root = firebase.database().ref();
            var uid = firebaseUser.uid;
            var info = {
                "wins" : 0,
                "losses" : 0,
                "avg score" : 0,
                "email" : username.value,
                "username" : username.value
            }
            root.child("users").child(uid).set(info);

            firebase.auth().signOut();
            //localStorage.clear();
            //window.location.href = "index.html";
        }
        else {
            console.log('User not created');
        }
    });