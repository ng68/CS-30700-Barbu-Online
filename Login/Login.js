var email = document.getElementById("inputEmail");
var password = document.getElementById("inputPassword");
var loginbtn = document.getElementById("loginbtn");
var signupbtn = document.getElementById("signupbtn");
const auth = firebase.auth();

localStorage.clear();
auth.signOut();

loginbtn.addEventListener('click', e => {
    const user = email.value;
    const pass = password.value;
    
    const promise = auth.signInWithEmailAndPassword(user,pass).catch(function(error){
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
        }
        if (errorCode === 'auth/user-not-found') {
            alert('User Not Found.');
        }
        if(errorCode === 'auth/invalid-email') {
            alert('Invalid Email');
        }
        else {
            alert(errorMessage);
        }
    });

    auth.onAuthStateChanged(function(user) {
    if(user){
        console.log('Signed In');
        window.location.href = "home.html";
        }
    });
});

signupbtn.addEventListener('click', e=> {
    window.location.href = "Signup.html";
});

