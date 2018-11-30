let socket = io('https://protected-reef-35837.herokuapp.com');
var str = '';
var users = [];
firebase.database().ref("users").orderByChild("avg_score").on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        users.push([childSnapshot.val().username, childSnapshot.val().wins, childSnapshot.val().avg_score]);
    });
    users.sort(sort_function);
    var top100 = users.slice(0, 100);
    for(var i = 0; i < top100.length; i++) {
	    str += '<tr>\n<td>' + (i+1) + '</td>\n';
	    str += '<td>' + top100[i][0] + '</td>\n';
	    str += '<td>' + top100[i][1] + '</td>\n';
	    str += '<td>' + top100[i][2] + '</td>\n';
	    str += '</tr>\n';
    }
    document.getElementById("table").innerHTML += str;
});

firebase.auth().onAuthStateChanged( user => {
    if (user) 
    {
        socket.emit('user-info', {
            uid: user.uid
        });
    }
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