const io = require('socket.io')(8080);

const chatNamespace = io.of('/chat');
const lobbiesNamespace = io.of('/lobbies');
const gamesNamespace = io.of('/games');

let lobbies = [];
let gameHash = {};

class Card {
	constructor(suit, value) {
		this.suit = suit;
		this.rank = value
		switc(value) {
			case 11:
				this.card = "Jack";
				break;
			case 12:
				this.card = "Queen";
				break;
			case 13:
				this.card = "King";
				break;
			case 14:
				this.card = "Ace";
				break;
			default:
				this.card = this.rank;
		}
	}
	
	to_string() {
		return this.card + " of " + this.suit;
	}
}

class Hand {
	constructor(integer_array) {
		this.cards = []
		for(var i = 0; i < integer_array.length; i++) {
			this.cards.push(new Card(integer_array[i]));
		}
	}
	
	has_suit(suit) {
		for(var i = 0; i < this.cards.length; i++) {
			if(this.cards[i].suit == suit) {
				return true;
			}
		}
		return false;
	}
	
	has_hearts() {
		for(var i = 0; i < this.cards.length; i++) {
			if(this.cards[i].suit == "Heart") {
				return true;
			}
		}
		return false;
	}
	
	remove_card(card) {
		this.cards.splice(this.cards.indexOf(card), 1);
	}
}

class Trick {
	constructor() {
		this.cards = [];
		this.players = [];
	}
	
	add_card(player, card) {
		this.cards.push(card);
		this.players.push(player);
	}
	
	winner() {
		let max = 0;
		for(var i = 1; i < 4; i++) {
			if(this.cards[i].suit == this.cards[0].suit && this.cards[i].rank > this.cards[max].rank) {
				max = i;
			}
		}
		return this.players[max];
	}
}

class Subgame {
	// Player[] players
	// int current_player (corresponds to index of players array)
	// Trick current_trick
	// dict player_to_cards_taken
	constructor(dealer, dealerHand, p2, p2Hand, p3, p3Hand, p4, p4Hand, game_type) {
		this.players = [dealer, p2, p3, p4];
		this.current_player = dealer;
		this.current_index = 0;
		this.current_trick = new Trick();
		this.player_to_cards_taken = {};
		for(var i = 0; i < 4; i++) {
			this.player_to_cards_taken[this.players[i]] = [];
		}
		this.game_type = game_type;
	}
		
	game_done() {
		switch(this.game_type) {
			case "Last Two":
				return false;
				break;
			case "Losers":
				return false;
				break;
			case "Trumps":
				return false;
				break;
			case "Hearts":
				// If all hearts have been played, game is over
				var num_hearts = 0;
				for(var player in this.player_to_cards_taken) {
					for(var i = 0; i < this.player_to_cards_taken[player].length; i++) {
						if(this.player_to_cards_taken[player][i].suit == "Heart") {
							num_hearts++;
						}
					}
				}
				if(num_hearts == 13) return true;
				else return false;
				break;
			case "Barbu":
				// If the King of Hearts has been played, game is over
				for(var player in this.player_to_cards_taken) {
					for(var i = 0; i < this.player_to_cards_taken[player].length; i++) {
						if(this.player_to_cards_taken[player][i].suit == "Heart" && this.player_to_cards_taken[player][i].card == "King") {
							return true;
						}
					}
				}
				return false;
				break;
			case "Queens":
				var num_queens = 0;
				for(var player in this.player_to_cards_taken) {
					for(var i = 0; i < this.player_to_cards_taken[player].length; i++) {
						if(this.player_to_cards_taken[player][i].card == "Queen") {
							num_queens++;
						}
					}
				}
				if(num_queens == 4) return true;
				else return false;
				break;
			default:
				return false;
		}
		return false;
	}
	
	compute_score() {
		return;
	}
}

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
    socket.on('entered-lobby', data => {
        let lobby;
        lobbies.forEach(l => {
            if (l.name == data) {
                lobby = l;
            }
        });
        socket.emit('entered-lobby-response', lobby);
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
        if (gameHash[data.lobbyname] == null) { // This game does not exist in the game hash yet
            let game = { // Initialize an object corresponding to the game TODO: Add any other necessary fields
                players: [],
                currentDealer: 0,
                handHash: {}, // TODO edit this code to whatever is actually needed later
				gamesChosen: {},
                subgame: {}
            };

            game.players.push(data.username); // Add the player to the players array.
			game.gamesChosen[data.username] = [];
            game.dealerIndex = 0; // The first player that joins (i.e. the host) will be the first dealer
            gameHash[data.lobbyname] = game; // Add the game to the gamehash.
        } else { // The game already exists
            gameHash[data.lobbyname].players.push(data.username); // Add the player to the lobby.
            // NOTE: The above assumes that there aren't already 4 players in the game. This is checked
            // in the lobbies namespace in 'join-lobby'.
        }

        socket.join(data.lobbyname); // Add the socket to a socket.io room corresponding to the user's game
        io.to(data.lobbyname).emit('player-joined', { // Send a message to other clients in the lobby that a player joined, with the list of players
            players: gameHash[data.lobbyname].players
        });
    });

    // This event should be emitted by the client who is hosting the game once the user is ready to start playing.
    // It expects an object "data" of the form {
    //     lobbyname: String,
    // }
    socket.on('start-game', data => {
        // Verify that there are 4 players in the game
        let game = gameHash[data.lobbyname];
        if (game == null || game.players.length != 4) {
            socket.emit('start-game-response', "ERROR"); // Emit an error to the host that something went wrong
            return;
        }

        // Code below here prepares the game for start

        // 1. Shuffle deck

        // 2. Assign hands to players
        let handobject = {};
        for (player in game.players) {
            let hand = [];

            // Assign subset of the deck to each player

            handobject[player] = hand;
        }
        game.handHash = handobject; // write the hand object to the global data structure

        socket.emit('start-game-response', "OK"); // Let the host client know that the game started correctly
        io.to(data.lobbyname).emit('cards-dealt', handobject); // Send the hands to all the clients.
    });

    // ANY NECESSARY SERVER-SIDE DEALER LOGIC GOES HERE AND POSSIBLY IN THE EVENT ABOVE

    // The next event is when the dealer picks the subgame.
    // In this case the data object needs two things, the lobby name and the game choice: {
    //    lobbyname: String,
    //    gamechoice: String
    // }
    socket.on('subgame-chosen', data => {
        // data.gamechoice
        // May need to do an error check (i.e. did this dealer already pick this subgame?)
        // If we do error checking and there's an error, just do socket.emit('subgame-chosen-response', "ERROR");

        // TODO: update internal data structures based on subgame choice
		var game = gameHash[data.lobbyname];
		
		if(game.gamesChosen[data.username].indexOf(data.gamechoice) < 0) {
			// User hasn't chosen game
			
			// Create new subgame
			game.subgame = new Subgame(game.players[0], game.players[1], game.players[2], game.players[3], data.gamechoice);
			
			
			io.to(data.lobbyname).emit('subgame-choice', data.gamechoice); // FOR NOW just emit a string of the chosen game
                                                                       // (May need to change later)
		}
		
		else {
			// User has chosen game
			socket.emit('subgame-chosen-response', "ERROR");
		}
		

    });

    // DOUBLES LOGIC GOES HERE AND POSSIBLY IN THE EVENT ABOVE

    // Somehow we need to send a 'your-turn' to the client whose turn it is, to start the play. Maybe it will be at the end of the doubles logic

    // This event is for when a card is chosen by the user. It takes an object data containing {
    //    lobbyname: String,
    //    cardValue: Integer,
    //    cardSuit: String
    // }
    socket.on('card-chosen', data => {
        // TODO update the gameplay logic in here. Right now it's very primitive and only
        // works for the trick-based games.

		card = new Card(data.cardSuit, data.cardValue);
		
		
        // TODO evaluate if card is valid

        // gameHash[data.lobbyname].currentTrick.push({
            // value: data.cardValue,
            // suit: data.cardSuit
        // }); // For now just pushing a basic object. In the future we can change it

        io.to(data.lobbyname).emit('card-played', {
            cardValue: data.cardValue,
            cardSuit: data.cardSuit
        }); // Let the rest of the lobby know what the card was. Can be changed later

        if (gameHash[data.lobbyname].currentTrick.length == 4) { // Last card played
            // TODO Evaluate who won the trick

            // Update score and whatnot internally, clear currentTrick, etc.

            io.to(data.lobbyname).emit('game-update', {
                // Send data to clients about the outcome of the trick
            });
        }

        // TODO emit a 'your-turn' event to whoever has the next turn
    });
});

chatNamespace.on('connection', socket => {
    console.log("Chat connected");
});

io.on('connection', socket => {
    console.log("Root connected");
});
