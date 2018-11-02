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
		for(var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			var s = card.suit + card.rank;
			array.push(s);
		}
		return array;
	}
}

class Trick {
	constructor(trump) {
		this.trump = trump;
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
			else if(this.cards[i].suit == this.trump && this.cards[max].suit == this.trump && this.cards[i].rank > this.cards[max].rank) {
				// Over-trump
				max = i;
			}
			else if(this.cards[i].suit == this.trump && this.cards[max].suit != this.trump) {
				// Trump
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
	constructor(dealer, p2, p3, p4, hands, game_type, trump) {
		this.players = [dealer, p2, p3, p4];
		this.hands = hands;
		this.current_player = dealer;
		this.current_index = 0;
		this.current_trick = new Trick(trump);
		this.cards_taken = {};
		for(var i = 0; i < 4; i++) {
			this.cards_taken[this.players[i]] = [];
		}
		this.game_type = game_type;
		this.num_tricks = 0;
		this.last2 = [];
		this.trump = trump;
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
		return true;
	}
	
	explanation(player, card) {
		if(this.current_trick.cards.length != 0) {
			// Not the lead
			if(card.suit != this.current_trick.cards[0].suit) {
				// Pitch
				if(this.hands[player].has_suit(this.current_trick.cards[0].suit)) {
					// Illegal pitch
					return "You must follow suit if you can";
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
						return "You can't lead a heart unless that's all you have";
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
							return "You can't lead a heart until they've been broken";
						}
					}
				}
			}
		}
		return "";
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
	
	compute_score(player) {
		switch(this.game_type) {
			case "Trumps":
				return (this.cards_taken[player].length / 4) * 5;
				break;
			case "Barbu":
				for(var i = 0; i < this.cards_taken[player].length; i++) {
					var c = this.cards_taken[player][i];
					if(c.suit == 'h' && c.card == 'King') {
						return -15;
					}
				}
				return 0;
				break;
			case "Queens":
				var num_queens = 0;
				for(var i = 0; i < this.cards_taken[player].length; i++) {
					var c = this.cards_taken[player][i];
					if(c.card == 'Queen') {
						num_queens++;
					}
				}
				return num_queens * -6;
				break;
			case "Hearts":
				var score = 0;
				for(var i = 0; i < this.cards_taken[player].length; i++) {
					var c = this.cards_taken[player][i];
					if(c.suit == 'h') {
						if(c.card == 'Ace') score -= 6;
						else score -= 2;
					}
				}
				return score;
				break;
			case "Losers":
				return (this.cards_taken[player].length / 4) * -2;
				break;
			case "Last Two":
				score = 0;
				if(this.last2[0] == player) score -= 10;
				if(this.last2[1] == player) score -= 20;
				return score;
				break;
			default:
				return 0;
		}
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
				scoreHash: {},
				gamesChosen: {},
                subgame: {}
            };

            game.players.push(data.username); // Add the player to the players array.
			game.gamesChosen[data.username] = [];
			game.scoreHash[data.username] = 0;
            game.dealerIndex = 0; // The first player that joins (i.e. the host) will be the first dealer
            gameHash[data.lobbyname] = game; // Add the game to the gamehash.
        } else { // The game already exists
            gameHash[data.lobbyname].players.push(data.username); // Add the player to the lobby.
			gameHash[data.lobbyname].gamesChosen[data.username] = [];
			gameHash[data.lobbyname].scoreHash[data.username] = 0;

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
            for (var i = 0; i < game.players.length; i++) {
				let player = game.players[i];
				let player_cards = cards.splice(0,13);
                let hand = new Hand(player_cards);
    
                // Assign subset of the deck to each player
                handobject[player] = hand.as_array();
				game.handHash[player] = hand;
            }
			handobject["dealer"] = game.players[game.currentDealer];
			handobject["scores"] = [];
            gamesNamespace.to(data.lobbyname).emit('cards-dealt', handobject); // Send the hands to all the clients.
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
			var players = [];
			for(var i = 0; i < 4; i++) {
				players.push(game.players[(game.dealerIndex + i) % 4]);
			}
			game.subgame = new Subgame(players[0], players[1], players[2], players[3], game.handHash, data.gamechoice, data.trump);
			
			// Add subgame to completed subgames
			game.gamesChosen[data.username].push(data.gamechoice);
			
			gamesNamespace.to(data.lobbyname).emit('subgame-choice', {
                gamechoice: data.gamechoice
            }); // FOR NOW just emit a string of the chosen game

            gamesNamespace.to(data.lobbyname).emit('your-turn', {
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

		var card = new Card(data.cardSuit, data.cardValue);
		var subgame = gameHash[data.lobbyname].subgame;
		var game = gameHash[data.lobbyname];
		
        // TODO evaluate if card is valid
		if(subgame.legal_play(data.username, card)) {
			// Add card to trick
			subgame.current_trick.add_card(data.username, card);
			
			// Remove card from hand
			subgame.hands[data.username].remove_card(card);
			
			// Update current player
			if(subgame.current_index == 3) subgame.current_index = 0;
			else subgame.current_index++;
            subgame.current_player = subgame.players[subgame.current_index];
            gamesNamespace.to(data.lobbyname).emit('card-chosen-response', {
                valid: true,
				username: data.username,
				card: card.suit + card.rank
            });
		}
		else {
            // TODO send error to client
			var explanation = subgame.explanation(data.username, card);
            gamesNamespace.to(data.lobbyname).emit('card-chosen-response', {
                valid: false,
				username: data.username,
				error: "Illegal play",
				card: card.suit + card.rank,
				error: explanation
            });

            return;
		}

        if (subgame.current_trick.cards.length == 4) { // Last card played
		
            // Evaluate who won the trick
			var winner = subgame.current_trick.winner();
			subgame.current_player = winner;
			subgame.current_index = subgame.players.indexOf(winner);

			if(subgame.num_tricks >= 11) subgame.last2.push(winner);
			// Add cards to trick winner's taken cards
			for(var i = 0; i < 4; i++) {
				subgame.cards_taken[winner].push(subgame.current_trick.cards[i]);
			}
			
			subgame.num_tricks++;
			subgame.current_trick = new Trick(subgame.trump);

			if(subgame.game_done()) {
				// GAME IS OVER
				
				// Update scores
				for(var i = 0; i < game.players.length; i++) {
					var p = game.players[i];
					game.scoreHash[p] += subgame.compute_score(p);
				}

				// Check if entire game is done
				done = true;
				for(var i = 0; i < game.players.length; i++) {
					if(game.gamesChosen[game.players[i]].length != 7) {
						done = false;
					}
				}
				
				if(done) {
					gamesNamespace.to(data.lobbyname).emit('game-finished', game.scoreHash);
					console.log("GAME OVER");
				}
				
				// Update dealer
				game.dealerIndex = (game.dealerIndex + 1) % 4;
				var new_dealer = game.players[game.dealerIndex];
				
				// Clear current subgame
				game.subgame = {};
				
				// Prepare next hand
				
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
				for (var i = 0; i < game.players.length; i++) {
					let player = game.players[i];
					let player_cards = cards.splice(0,13);
					let hand = new Hand(player_cards);
		
					// Assign subset of the deck to each player
					handobject[player] = hand.as_array();
					game.handHash[player] = hand;
				}
				handobject["dealer"] = game.players[game.currentDealer];
				handobject["scores"] = [];
				for(var i = 0; i < game.players.length; i++) {
					let player = game.players[i];
					handobject["scores"].push(game.scoreHash[player]);
				}
				gamesNamespace.to(data.lobbyname).emit('cards-dealt', handobject); // Send the hands to all the clients.
			}
			else {
				gamesNamespace.to(data.lobbyname).emit('your-turn', {
				username: subgame.current_player
				});
            // gamesNamespace.to(data.lobbyname).emit('game-update', {
                // // Send data to clients about the outcome of the trick
            // });
			}
		}
		else {
			gamesNamespace.to(data.lobbyname).emit('your-turn', {
				username: subgame.current_player
			});
		}
    });
});

chatNamespace.on('connection', socket => {
    console.log("Chat connected");
});

io.on('connection', socket => {
    console.log("Root connected");
});
