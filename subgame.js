class Card {
	constructor(n) {
		this.suit = '';
		if(Math.floor(n / 13) == 0) {
			this.suit = "Club";
		}
		else if(Math.floor(n / 13) == 1) {
			this.suit = "Diamond";
		}
		else if(Math.floor(n / 13) == 2) {
			this.suit = "Heart";
		}
		else if(Math.floor(n / 13) == 3) {
			this.suit = "Spade";
		}
		if (n % 13 == 0) {
			this.rank = 14;
		}
		else {
			this.rank = n % 13 + 1;
		}
		switch(this.rank) {
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
		return this.card + " of " + this.suit + "s";
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

class Player {
	constructor(hand) {
		this.hand = hand;
	}
}

class Subgame {
	// Player[] players
	// int current_player (corresponds to index of players array)
	// Trick current_trick
	// dict player_to_cards_taken
	constructor(dealer, p2, p3, p4, game_type) {
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
	
	play_game() {
		for(var i = 0; i < 13; i++) {
			this.current_trick = new Trick();
			for(var j = 0; j < 4; j++) {				
				// Get card from player
				var card = this.get_card(this.current_player);
				
				// Add card to current trick
				this.current_trick.add_card(this.current_player, card);
			
				// Remove card from player's hand
				this.current_player.hand.remove_card(card);
				
				// Update current player
				if(this.current_index == 3) this.current_index = 0;
				else this.current_index++;
				this.current_player = this.players[this.current_index];
			}
			// Get trick winner
			var winner = this.current_trick.winner();
			console.log("Trick ", i);
			console.log(this.current_trick.cards[0].to_string());
			console.log(this.current_trick.cards[1].to_string());
			console.log(this.current_trick.cards[2].to_string());
			console.log(this.current_trick.cards[3].to_string());
			console.log();
			
			// Add cards taken to winner
			for(var k = 0; k < this.current_trick.cards.length; k++) {
				this.player_to_cards_taken[winner].push(this.current_trick.cards[k]);
			}
			if(i == 12 || this.game_done()) {
				this.compute_score();
				return;
			}
			else {
				this.current_player = winner;
				// Send message to current_player
			}
		}
	}
	
	get_card(player) {
		return player.hand.cards[Math.floor(Math.random() * player.hand.cards.length)];
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

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	return array;
}

a = [...Array(52).keys()];

let p1 = new Player(new Hand(a.splice(0, 13)));
let p2 = new Player(new Hand(a.splice(0, 13)));
let p3 = new Player(new Hand(a.splice(0, 13)));
let p4 = new Player(new Hand(a.splice(0, 13)));

var game = new Subgame(p1, p2, p3, p4, "Barbu");
game.play_game();