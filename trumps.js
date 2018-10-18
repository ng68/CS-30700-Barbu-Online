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
}

class Trick {
	constructor() {
		this.cards = [];
	}
	
	add_card(c) {
		this.cards.push(c);
	}
	
	winner() {
		let max = this.cards[0];
		for(var i = 1; i < 4; i++) {
			if(this.cards[i].suit == this.cards[0].suit && this.cards[i].rank > max.rank) {
				max = this.cards[i];
			}
		}
		return max;
	}
}

let c1 = new Card(40);
let c2 = new Card(47);
let c3 = new Card(26);
let c4 = new Card(46);
let t = new Trick();
t.add_card(c1);
t.add_card(c2);
t.add_card(c3);
t.add_card(c4);
let c = t.winner();
console.log("First card: " + c1.card + " of " + c1.suit + "s");
console.log("Second card: " + c2.card + " of " + c2.suit + "s");
console.log("Third card: " + c3.card + " of " + c3.suit + "s");
console.log("Fourth card: " + c4.card + " of " + c4.suit + "s");
console.log("Winner: " + c.card + " of " + c.suit + "s");