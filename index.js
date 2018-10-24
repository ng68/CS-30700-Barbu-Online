const io = require('socket.io')(8080);

const chatNamespace = io.of('/chat');
const lobbiesNamespace = io.of('lobbies');

io.on('connection', socket => {
    console.log("Root connected");
});

chatNamespace.on('connection', socket => {
    console.log("Chat connected");
});

lobbiesNamespace.on('connection', socket => {
    console.log("Lobbies connected");

    lobbiesNamespace.emit('lobby', "hey");
});