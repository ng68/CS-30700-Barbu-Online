
//Tell the library which element to use for the table
cards.init({table:'#card-table'});

//Create a new deck of cards
deck = new cards.Deck(); 
//By default it's in the middle of the container, put it slightly to the side
deck.x -= 50;

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all); 
//No animation here, just get the deck onto the table.
deck.render({immediate:true});

//Now lets create a couple of hands, one face down, one face up.
upperhand = new cards.Hand({faceUp:true, y:80});
lefthand = new cards.Hand({faceUp:true, x:200});	
righthand = new cards.Hand({faceUp:false, x:1000});
lowerhand = new cards.Hand({faceUp:true, y:500});

//Lets add a discard pile
lowerDiscardPile = new cards.Deck({faceUp:true, y:320});
upperDiscardPile = new cards.Deck({faceUp:true, y:220});
leftDiscardPile = new cards.Deck({faceUp:true, x:550});
rightDiscardPile = new cards.Deck({faceUp:true, x:680});
deck.deal(13, [upperhand, lowerhand, lefthand, righthand], 20);


//Finally, when you click a card in your hand, if it's
//the same suit or rank as the top card of the discard pile
//then it's added to it
lowerhand.click(function(card){
	console.log(lowerhand[0].suit);
	lowerDiscardPile.addCard(card);
	lowerDiscardPile.render();
	lowerhand.render();
});

upperhand.click(function(card){
	upperDiscardPile.addCard(card);
	upperDiscardPile.render();
	upperhand.render();
});

lefthand.click(function(card){
	leftDiscardPile.addCard(card);
	leftDiscardPile.render();
	lefthand.render();
});

righthand.click(function(card){
	rightDiscardPile.addCard(card);
	rightDiscardPile.render();
	righthand.render();
});


//So, that should give you some idea about how to render a card game.
//Now you just need to write some logic around who can play when etc...
//Good luck :)
