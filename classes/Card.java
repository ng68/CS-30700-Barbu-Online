package classes;

enum Suit {
	Spades, Hearts, Diamonds, Clubs;
}

enum Value {
	Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King, Ace;
}

public class Card {
	private Suit suit;
	private Value value;
	private int rank;
	
	public Card(int num) {
		if (num / 13 == 0) {
			this.suit = Suit.Clubs;
		}
		else if (num / 13 == 1) {
			this.suit = Suit.Diamonds;
		}
		else if (num / 13 == 2) {
			this.suit = Suit.Hearts;
		}
		else if (num / 13 == 3) {
			this.suit = Suit.Spades;
		}
		else {
			this.suit = Suit.Clubs;
		}
		switch (num % 13) {
			case 0:
				this.value = Value.Two;
				break;
			case 1:
				this.value = Value.Three;
				break;
			case 2:
				this.value = Value.Four;
				break;
			case 3:
				this.value = Value.Five;
				break;
			case 4:
				this.value = Value.Six;
				break;
			case 5:
				this.value = Value.Seven;
				break;
			case 6:
				this.value = Value.Eight;
				break;
			case 7:
				this.value = Value.Nine;
				break;
			case 8:
				this.value = Value.Ten;
				break;
			case 9:
				this.value = Value.Jack;
				break;
			case 10:
				this.value = Value.Queen;
				break;
			case 11:
				this.value = Value.King;
				break;
			case 12:
				this.value = Value.Ace;
				break;
			default:
				this.value = Value.Two;
		}
		this.rank = num % 13;
	}
	
	// Getters
	public Suit get_suit() {
		return suit;
	}
	
	public Value get_value() {
		return value;
	}
	
	public int get_rank() {
		return rank;
	}
	
	// Setters
	public void set_suit(Suit s) {
		suit = s;
	}
	
	public void set_value(Value v) {
		value = v;
	}
	
	public void set_rank(int n) {
		rank = n;
	}
}