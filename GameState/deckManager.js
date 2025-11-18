class DeckManager {
    constructor(numberOfDecks = 6) {
        this.numberOfDecks = numberOfDecks;
        this.shoe = []; // The collection of cards being used
        this.discardPile = [];
        this.reshuffleThreshold = 0.25; // Reshuffle when 25% of cards remain
        
        this.initializeShoe();
    }
    
    initializeShoe() {
        // Clear existing shoe and discard pile
        this.shoe = [];
        this.discardPile = [];
        
        // Create the specified number of decks
        for (let deckIndex = 0; deckIndex < this.numberOfDecks; deckIndex++) {
            this.shoe.push(...this.createSingleDeck());
        }
        
        // Shuffle the shoe
        this.shuffle();
    }
    
    createSingleDeck() {
        const deck = [];
        
        // Create all 52 cards (13 ranks × 4 suits)
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(new Card(suit, rank));
            }
        }
        
        return deck;
    }
    
    shuffle() {
        // Fisher-Yates shuffle algorithm
        for (let currentIndex = this.shoe.length - 1; currentIndex > 0; currentIndex--) {
            const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
            
            // Swap cards
            const temporaryCard = this.shoe[currentIndex];
            this.shoe[currentIndex] = this.shoe[randomIndex];
            this.shoe[randomIndex] = temporaryCard;
        }
    }
    
    draw() {
        // Check if we need to reshuffle
        if (this.needsReshuffle()) {
            this.reshuffleShoe();
        }
        
        // Draw the top card from the shoe
        if (this.shoe.length === 0) {
            throw new Error('No cards left in shoe');
        }
        
        const drawnCard = this.shoe.pop();
        return drawnCard;
    }
    
    needsReshuffle() {
        const totalCards = this.numberOfDecks * 52;
        const cardsRemaining = this.shoe.length;
        const percentageRemaining = cardsRemaining / totalCards;
        
        return percentageRemaining <= this.reshuffleThreshold;
    }
    
    reshuffleShoe() {
        // Combine shoe and discard pile
        this.shoe.push(...this.discardPile);
        this.discardPile = [];
        
        // Shuffle everything
        this.shuffle();
    }
    
    discardCard(card) {
        // Add card to discard pile
        this.discardPile.push(card);
    }
    
    discardHand(hand) {
        // Discard all cards from a hand
        for (const card of hand.cards) {
            this.discardCard(card);
        }
    }
    
    getCardsRemaining() {
        return this.shoe.length;
    }
    
    getTotalCards() {
        return this.numberOfDecks * 52;
    }
    
    getPercentageRemaining() {
        return (this.shoe.length / this.getTotalCards()) * 100;
    }
    
    setReshuffleThreshold(threshold) {
        // threshold should be between 0 and 1 (e.g., 0.25 for 25%)
        if (threshold < 0 || threshold > 1) {
            throw new Error('Reshuffle threshold must be between 0 and 1');
        }
        this.reshuffleThreshold = threshold;
    }
}