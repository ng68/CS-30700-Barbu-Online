console.log("HI");
str = ''
users = []
firebase.database().ref("users").orderByChild("avg_score").on("value", function(snapshot) {
	snapshot.forEach(function(childSnapshot) {
		users.push([childSnapshot.val().username, childSnapshot.val().wins, childSnapshot.val().avg_score]);
		console.log(childSnapshot.val().username, childSnapshot.val().avg_score);
	});
});

users.sort(sort_function)
top100 = users.slice(0, 100)
for(var i = 0; i < top100.length; i++) {
	str += '<tr>\n<th scope=\"row\">' + i + '</th>\n';
	str += '<td>' + top100[i][0] + '</td>\n';
	str += '<td>' + top100[i][1] + '</td>\n';
	str += '<td>' + top100[i][2] + '</td>\n';
	str += '</tr>\n';
}
document.getElementById("table").innerHTML += str;


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