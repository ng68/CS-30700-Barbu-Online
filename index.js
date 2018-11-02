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
		switch(value) {
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
	constructor(cards) {
		this.cards = cards;
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
			if(this.cards[i].suit == 'h') {
				return true;
			}
		}
		return false;
	}
	
	remove_card(card) {
		this.cards.splice(this.cards.indexOf(card), 1);
	}
	
	as_array() {
		var array = [];
		for card in this.cards {
			var s = card.suit + card.rank;
			array.push(s);
		}
		return array;
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
	// players array
	// hands hashes player to hand
	// int current_player (corresponds to index of players array)
	// current_trick
	// cards_taken
	constructor(dealer, p2, p3, p4, hands, game_type) {
		this.players = [dealer, p2, p3, p4];
		this.hands = hands;
		this.current_player = dealer;
		this.current_index = 0;
		this.current_trick = new Trick();
		this.cards_taken = {};
		for(var i = 0; i < 4; i++) {
			this.cards_taken[this.players[i]] = [];
		}
		this.game_type = game_type;
		this.num_tricks = 0;
	}
	
	legal_play(player, card) {
		if(this.current_trick.cards.length != 0) {
			// Not the lead
			if(card.suit != this.current_trick.cards[0].suit) {
				// Pitch
				if(this.hands[player].has_suit(this.current_trick.cards[0].suit)) {
					// Illegal pitch
					return false;
				}
			}
		}
		else {
			// Lead
			if(this.game_type == "Barbu") {
				if(card.suit == 'h') {
					// Led heart
					if(this.hands[player].has_suit('s') || this.hands[player].has_suit('d') || this.hands[player].has_suit('c')) {
						// Not heart-tight
						return false;
					}
				}
			}
			else if(this.game_type == "Hearts") {
				if(card.suit == 'h') {
					// Led heart
					var num_hearts = 0;
					for(var player in this.cards_taken) {
						for(var i = 0; i < this.cards_taken[player].length; i++) {
							if(this.cards_taken[player][i].suit == 'h') {
								num_hearts++;
							}
						}
					}
					if(num_hearts == 0) {
						// Hearts haven't been broken
						if(this.hands[player].has_suit('s') || this.hands[player].has_suit('d') || this.hands[player].has_suit('c')) {
							// Not heart-tight
							return false;
						}
					}
				}
			}
		}
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
				for(var player in this.cards_taken) {
					for(var i = 0; i < this.cards_taken[player].length; i++) {
						if(this.cards_taken[player][i].suit == 'h') {
							num_hearts++;
						}
					}
				}
				if(num_hearts == 13) return true;
				else return false;
				break;
			case "Barbu":
				// If the King of Hearts has been played, game is over
				for(var player in this.cards_taken) {
					for(var i = 0; i < this.cards_taken[player].length; i++) {
						if(this.cards_taken[player][i].suit == 'h' && this.cards_taken[player][i].card == "King") {
							return true;
						}
					}
				}
				return false;
				break;
			case "Queens":
				var num_queens = 0;
				for(var player in this.cards_taken) {
					for(var i = 0; i < this.cards_taken[player].length; i++) {
						if(this.cards_taken[player][i].card == "Queen") {
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

        if (gameHash[data.lobbyname].players.length == 4) { // Deal
            let game = gameHash[data.lobbyname];
    
            // Code below here prepares the game for start
    
            // 1. Shuffle deck
			var a = [...Array(52).keys()];
			for (var i = a.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = a[i];
				a[i] = a[j];
				a[j] = temp;
			}
			var cards = []
			for(var i = 0; i < a.length; i++) {
				switch(Math.floor(a[i] / 13)) {
					case 0:
						var card = new Card('s', a[i] % 13 + 2);
						cards.push(card);
						break;
					case 1:
						var card = new Card('h', a[i] % 13 + 2);
						cards.push(card);
						break;
					case 2:
						var card = new Card('d', a[i] % 13 + 2);
						cards.push(card);
						break;
					case 3:
						var card = new Card('c', a[i] % 13 + 2);
						cards.push(card);
						break;
					default:
						break;
				}
			}
			console.log(cards);
            // 2. Assign hands to players
            let handobject = {};
            for (player in game.players) {
				let player_cards = cards.splice(0,13);
                let hand = new Hand(player_cards);
    
                // Assign subset of the deck to each player
                handobject[player] = hand.as_array();
				game.handHash[player] = hand;
            }
			handobject["dealer"] = game.players[game.currentDealer];
			handobject["scores"] = [];
            io.to(data.lobbyname).emit('cards-dealt', handobject); // Send the hands to all the clients.
        }
    });

    // ANY NECESSARY SERVER-SIDE DEALER LOGIC GOES HERE AND POSSIBLY IN THE EVENT ABOVE

	// NOTE FROM MATT: ALSO NEED USERNAME

    // The next event is when the dealer picks the subgame.
    // In this case the data object needs two things, the lobby name and the game choice: {
    //    username: String,
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
			game.subgame = new Subgame(game.players[0], game.players[1], game.players[2], game.players[3], hands, data.gamechoice);
			
			
			io.to(data.lobbyname).emit('subgame-choice', {
                gamechoice: data.gamechoice
            }); // FOR NOW just emit a string of the chosen game
                                                                       // (May need to change later)

            io.to(data.lobbyname).emit('your-turn', {
                username: game.players[(game.dealerIndex + 1) % 4]
            });
		}
		
		else {
			// User has chosen game
			socket.emit('subgame-chosen-response', "ERROR");
		}
    });

    // DOUBLES LOGIC GOES HERE AND POSSIBLY IN THE EVENT ABOVE

    // Somehow we need to send a 'your-turn' to the client whose turn it is, to start the play. Maybe it will be at the end of the doubles logic
    
    // cardValue: a number 2-14, cardSuit: a lower case letter
    // This event is for when a card is chosen by the user. It takes an object data containing {
    //    username: String,
    //    lobbyname: String,
    //    cardValue: Integer,
    //    cardSuit: String
    // }
    socket.on('card-chosen', data => {
        // TODO update the gameplay logic in here. Right now it's very primitive and only
        // works for the trick-based games.

		card = new Card(data.cardSuit, data.cardValue);
		subgame = gameHash[data.lobbyname].subgame;
		
        // TODO evaluate if card is valid
		if(subgame.legal_play(data.username, card)) {
			// Add card to trick
			subgame.current_trick.add(data.username, card);
			
			// Remove card from hand
			subgame.hands[data.username].remove_card(card);
			
			// Update current player
			if(subgame.current_index == 3) subgame.current_index = 0;
			else subgame.current_index++;
            subgame.current_player = subgame.players[subgame.current_index];
            socket.emit('card-chosen-response', {
                valid: true
            });
		}
		else {
            // TODO send error to client
            socket.emit('card-chosen-response', {
                valid: false
            });

            return;
		}

        io.to(data.lobbyname).emit('card-played', {
            cardValue: data.cardValue,
            cardSuit: data.cardSuit,
            username: data.username
        }); // Let the rest of the lobby know what the card was. Can be changed later

        if (subgame.current_trick.length == 4) { // Last card played
		
            // TODO Evaluate who won the trick
			var winner = subgame.current_trick.winner();

			// Add cards to trick winner's taken cards
			for(var i = 0; i < 4; i++) {
				subgame.cards_taken[winner].push(subgame.current_trick.cards[i]);
			}
			
			subgame.num_tricks++;
			subgame.current_trick = new Trick();

			if(subgame.game_done()) {
				// GAME IS OVER
				// TOOD send game over update, deal new hands
			}
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
