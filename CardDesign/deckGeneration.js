// Blackjack - card generation and pure-CSS card rendering

const suits = [
  { id: 'spades', symbol: '♠' },
  { id: 'hearts', symbol: '♥' },
  { id: 'clubs', symbol: '♣' },
  { id: 'diamonds', symbol: '♦' },
];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

class Card 
{
    constructor(suit, rank) {
        this.suit = suit; // Will be one of the suit objects from the suits array
        this.rank = rank; // Will be one of the strings from ranks array
        this.isFaceDown = false;
    }
    
    getValue() {
        // Returns numeric value for hand calculation
        // Note: Aces are initially valued at 11, we'll adjust in hand calculation
        if (this.rank === 'A') {
            return 11;
        }
        
        if (this.rank === 'J' || this.rank === 'Q' || this.rank === 'K') {
            return 10;
        }
        
        return parseInt(this.rank);
    }
    
    isAce() {
        return this.rank === 'A';
    }
    
    isTenValue() {
        return this.rank === '10' || this.rank === 'J' || this.rank === 'Q' || this.rank === 'K';
    }
    
    flip() {
        // Flips card between face up and face down
        this.isFaceDown = !this.isFaceDown;
    }
    
    reveal() {
        // Shows a face-down card
        this.isFaceDown = false;
    }
    
    hide() {
        // Hides a face-up card
        this.isFaceDown = true;
    }
    
    toString() {
        // For debugging - shows card as readable string
        return this.rank + this.suit.symbol;
    }
}

function makeDeck()
{
  const deck = [];
  for (const suit of suits)
  {
    for (const rank of ranks)
    {
      deck.push(new Card(suit, rank));
    }
  }
  return deck;
}

function shuffle(deck)
{
  for (let i = deck.length - 1; i > 0; i--)
  {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Attach UI listeners
document.addEventListener('DOMContentLoaded', () =>
{
  const show = document.getElementById('show-deck');
  if (show)
  {
    show.addEventListener('click', showAllCardsDemo);
  }
});
