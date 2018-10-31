const io = require('socket.io')(8080);

const chatNamespace = io.of('/chat');
const lobbiesNamespace = io.of('/lobbies');
const gamesNamespace = io.of('/games');

let lobbies = [];
let gameHash = {};

// The events in the lobbies namespace deal with functionality that takes place on the
// lobbies page.
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
            lobbiesNamespace.emit('lobby-updated', lobby); // Let everyone else know the lobby updated
            socket.emit('join-lobby-response', "OK");
        }
    });
});

// The games namespace is for individual game lobbies that people join. The /games channel itself is never used,
// but rather an individual room is created for each game.
gamesNamespace.on('connection', socket => {
    console.log("Games connected");

    // This function needs to be called as soon as a player
    // goes to the game/lobby page (after joining/creating a lobby on the lobbIES page)
    // Expects an object data of the form {
    //    lobbyname: String,
    //    username: String
    // }
    socket.on('player-info', data => {
        socket.join(data.lobbyname); // Add socket to a socket.io room corresponding to the user's game
        io.to(data.lobbyname).emit('player-joined', { // Send a message to other clients in the lobby that a player joined, with their username
            username: data.username
        });
    });

    // This event should be emitted by the client who is hosting the game once the user is ready to start playing.
    // It expects an object "data" of the form {
    //     lobbyname: String,
    // }
    socket.on('start-game', data => {
        
    });
});

chatNamespace.on('connection', socket => {
    console.log("Chat connected");
});

io.on('connection', socket => {
    console.log("Root connected");
});