const io = require('socket.io')(8080);

const chatNamespace = io.of('/chat');
const lobbiesNamespace = io.of('lobbies');

let lobbies = [];

io.on('connection', socket => {
    console.log("Root connected");
});

chatNamespace.on('connection', socket => {
    console.log("Chat connected");
});

lobbiesNamespace.on('connection', socket => {
    console.log("Lobbies connected");

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
            lobbies.push(lobby);
            socket.emit('lobby-created-response', "OK");
        } else {
            // Cannot create lobby either because the owner already has a lobby or
            // the lobby name already exists.
            socket.emit('lobby-created-response', "ERROR");
        }
    });
});