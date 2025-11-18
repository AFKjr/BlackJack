class Hand {
    constructor() {
        this.cards = [];
    }
    
    addCard(card) {
        this.cards.push(card);
    }
    
    clear() {
        this.cards = [];
    }
    
    getCardCount() {
        return this.cards.length;
    }
    
    getBestTotal() {
        // Calculate the best possible total without busting
        // Aces can be 1 or 11, choose the best value
        
        let total = 0;
        let aceCount = 0;
        
        // First pass: count all cards, treating Aces as 1
        for (const card of this.cards) {
            if (card.isAce()) {
                aceCount++;
                total += 1;
            } else {
                total += card.getValue();
            }
        }
        
        // Second pass: try to use Aces as 11 if it doesn't bust
        while (aceCount > 0 && total + 10 <= 21) {
            total += 10; // Convert one Ace from 1 to 11
            aceCount--;
        }
        
        return total;
    }
    
    isBusted() {
        return this.getBestTotal() > 21;
    }
    
    isBlackjack() {
        if (this.cards.length !== 2) {
            return false;
        }
        
        const hasAce = this.cards.some(card => card.isAce());
        const hasTenValue = this.cards.some(card => card.isTenValue());
        
        return hasAce && hasTenValue;
    }
    
    isSoft() {
        // A hand is "soft" if it contains an Ace counted as 11
        let total = 0;
        let aceCount = 0;
        
        for (const card of this.cards) {
            if (card.isAce()) {
                aceCount++;
                total += 1;
            } else {
                total += card.getValue();
            }
        }
        
        // Check if we can use an Ace as 11
        return aceCount > 0 && total + 10 <= 21;
    }
    
    isSoft17() {
        return this.isSoft() && this.getBestTotal() === 17;
    }
    
    isPair() {
        // Check if hand is a pair (for splitting)
        if (this.cards.length !== 2) {
            return false;
        }
        
        return this.cards[0].rank === this.cards[1].rank;
    }
    
    canSplit() {
        return this.isPair();
    }
    
    revealHoleCard() {
        // Reveal all face-down cards (typically used for dealer's hole card)
        for (const card of this.cards) {
            if (card.isFaceDown) {
                card.reveal();
            }
        }
    }
    
    getVisibleTotal() {
        // Calculate total of only face-up cards (for dealer's visible hand)
        let total = 0;
        let aceCount = 0;
        
        for (const card of this.cards) {
            if (!card.isFaceDown) {
                if (card.isAce()) {
                    aceCount++;
                    total += 1;
                } else {
                    total += card.getValue();
                }
            }
        }
        
        // Try to use Aces as 11
        while (aceCount > 0 && total + 10 <= 21) {
            total += 10;
            aceCount--;
        }
        
        return total;
    }
    
    toString() {
        // For debugging - shows all cards in hand
        return this.cards.map(card => card.toString()).join(', ');
    }
}

class HandManager {
    constructor() {
        this.hands = [];
    }
    
    createHand() {
        const newHand = new Hand();
        this.hands.push(newHand);
        return newHand;
    }
    
    removeHand(hand) {
        const handIndex = this.hands.indexOf(hand);
        if (handIndex > -1) {
            this.hands.splice(handIndex, 1);
        }
    }
    
    clearAllHands() {
        this.hands = [];
    }
    
    getAllHands() {
        return this.hands;
    }
    
    splitHand(originalHand) {
        // Create two new hands from a pair
        if (!originalHand.canSplit()) {
            throw new Error('Hand cannot be split');
        }
        
        const firstCard = originalHand.cards[0];
        const secondCard = originalHand.cards[1];
        
        // Create two new hands
        const firstHand = this.createHand();
        const secondHand = this.createHand();
        
        firstHand.addCard(firstCard);
        secondHand.addCard(secondCard);
        
        // Remove the original hand
        this.removeHand(originalHand);
        
        return {
            firstHand: firstHand,
            secondHand: secondHand
        };
    }
}