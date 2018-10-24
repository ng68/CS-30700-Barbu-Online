const io = require('socket.io')(8080);

const chatNamespace = io.of('/chat');
const lobbiesNamespace = io.of('/lobbies');
const gamesNamespace = io.of('/games');

let lobbies = [];

io.on('connection', socket => {
    console.log("Root connected");
});

lobbiesNamespace.on('connection', socket => {
    console.log("Lobbies connected");

    // When the page loads (i.e. once a client joins lobbiesNamespace), want
    // to send the client all of the currently open lobbies
    lobbies.forEach(lobby => {
        socket.emit('new-lobby', {
            owner: lobby.owner,
            name: lobby.name,
            players: lobby.players
        });
    });

    // Event handler for user creating a new lobby
    // Expects an object lobbyData of the form {
    //    owner: String
    //    name: String
    // }
    socket.on('lobby-created', lobbyData => {
        let lobbyExists = false;
        lobbies.forEach(lobby => {
            if ((lobby.owner == lobbyData.owner) || (lobby.name == lobbyData.name)) {
                // Cannot create lobby
                lobbyExists = true;
            }
        });

        if (!lobbyExists) {
            let lobby = {
                owner: lobbyData.owner,
                name: lobbyData.name,
                players: []
            };

            lobby.players.push(lobbyData.owner); // Owner should be in lobby
            lobbies.push(lobby); // Add lobby data to global array
            lobbiesNamespace.emit('new-lobby', lobby); // Tell all clients that a new lobby is made
            socket.emit('lobby-created-response', "OK"); // Send response to user
        } else {
            // Cannot create lobby either because the owner already has a lobby or
            // the lobby name already exists.
            socket.emit('lobby-created-response', "ERROR"); // Send response to user
        }
    });

    // Event handler for user joining a lobby
    // Expects an object "data" of the form {
    //    lobbyName: String
    //    user: String
    // }
    socket.on('join-lobby', data => {
        let lobby;
        lobbies.forEach(l => {
            if (l.name == data.lobbyName) {
                lobby = l;
            }
        });

        if (lobby.players.length > 3) {
            // Cannot add a player because it's full.
            // TODO In the future we should probably also check if the username is in a different lobby
            // (We don't want users to be in multiple lobbies simultaneously)

            socket.emit('join-lobby-response', "ERROR");
        } else {
            lobby.players.push(data.user);
            lobbiesNamespace.emit('lobby-updated', lobby);
            socket.emit('join-lobby-response', "OK");
        }

        // test
        console.log("TEST:");
        lobbies.forEach(lobby => {
            console.log(lobby.name + " created by " + lobby.owner + " players:");
            lobby.players.forEach(player => {
                console.log(" " + player);
            });
        });
    });
});

chatNamespace.on('connection', socket => {
    console.log("Chat connected");
});

gamesNamespace.on('connection', socket => {
    console.log("Games connected");
});