// Game state enum
const GameState = {
    WAITING_FOR_BET: 'WAITING_FOR_BET',
    DEALING_CARDS: 'DEALING_CARDS',
    OFFERING_INSURANCE: 'OFFERING_INSURANCE',
    CHECKING_BLACKJACK: 'CHECKING_BLACKJACK',
    PLAYER_TURN: 'PLAYER_TURN',
    DEALER_TURN: 'DEALER_TURN',
    RESOLVING_BETS: 'RESOLVING_BETS',
    GAME_OVER: 'GAME_OVER'
};

class GameStateManager 
{
    constructor(deckManager, handManager, bankrollManager, uiManager) 
    {
        this.currentState = GameState.WAITING_FOR_BET;
        this.deckManager = deckManager;
        this.handManager = handManager;
        this.bankrollManager = bankrollManager;
        this.uiManager = uiManager;
        
        this.playerHand = null;
        this.dealerHand = null;
        this.currentBet = 0;
        this.lastBet = 0;
        this.insuranceBet = 0;
        this.hasInsurance = false;
    }
    
    // === BETTING ===
    handleBetting(betAmount) 
    {
        const MINIMUM_BET = 1;
        const MAXIMUM_BET = 1000;
        
        if (betAmount < MINIMUM_BET) {
            throw new Error('Bet is below table minimum of $' + MINIMUM_BET);
        }
        
        if (betAmount > MAXIMUM_BET) {
            throw new Error('Bet exceeds table maximum of $' + MAXIMUM_BET);
        }
        
        if (betAmount > this.bankrollManager.getBalance()) {
            throw new Error('Insufficient funds');
        }
        
        this.currentBet = betAmount;
        this.bankrollManager.placeBet(betAmount);
        
        this.uiManager.displayBet(betAmount);
        this.uiManager.enableDealButton();
    }

    repeatLastBet() 
    {
        if (this.lastBet === 0) 
        {
            this.uiManager.displayMessage('No previous bet to repeat');
            return;
        }
    
        if (this.currentState !== GameState.WAITING_FOR_BET) 
        {
            this.uiManager.displayMessage('Cannot place bet at this time');
            return;
        }
    
        if (this.lastBet > this.bankrollManager.getBalance()) 
        {
            this.uiManager.displayMessage(`Insufficient funds. Need $${this.lastBet}, have $${this.bankrollManager.getBalance().toFixed(2)}`);
            return;
        }
    
        // Use the same betting logic
        this.handleBetting(this.lastBet);
    
        // Automatically deal cards
        this.onDealButtonClick();
    }

    canRepeatBet() 
    {
        // Can't repeat if no previous bet exists
        if (this.lastBet === 0) {
            return false;
        }
    
        // Can't repeat if not in betting phase
        if (this.currentState !== GameState.WAITING_FOR_BET) {
            return false;
        }
    
        // Can't repeat if insufficient funds
        if (this.lastBet > this.bankrollManager.getBalance()) {
            return false;
        }
    
        return true;
    }
    
    onDealButtonClick() 
    {
        if (this.currentState !== GameState.WAITING_FOR_BET) {
            return;
        }
        
        if (this.currentBet === 0) {
            this.uiManager.displayMessage("Please place a bet first");
            return;
        }
        
        this.transitionToState(GameState.DEALING_CARDS);
        this.handleDealing();
    }
    
    handleDealing() 
    {
        // Clear previous hands
        this.playerHand = this.handManager.createHand();
        this.dealerHand = this.handManager.createHand();
        
        // Deal in proper order
        const playerCard1 = this.deckManager.draw();
        this.playerHand.addCard(playerCard1);
        
        const dealerCard1 = this.deckManager.draw();
        this.dealerHand.addCard(dealerCard1);
        
        const playerCard2 = this.deckManager.draw();
        this.playerHand.addCard(playerCard2);
        
        const dealerHoleCard = this.deckManager.draw();
        dealerHoleCard.isFaceDown = true;
        this.dealerHand.addCard(dealerHoleCard);
        
        // Update UI
        this.uiManager.displayPlayerHand(this.playerHand);
        this.uiManager.displayDealerHand(this.dealerHand);
        
        // Check if dealer shows Ace (for insurance)
        if (this.dealerHand.cards[0].rank === 'A') {
            this.transitionToState(GameState.OFFERING_INSURANCE);
            this.handleInsuranceOffer();
        } else {
            this.transitionToState(GameState.CHECKING_BLACKJACK);
            this.handleCheckingBlackjack();
        }
    }
    
    // === INSURANCE ===
    handleInsuranceOffer() 
    {
        const insuranceAmount = this.currentBet / 2;
        
        if (this.bankrollManager.getBalance() >= insuranceAmount) {
            this.uiManager.offerInsurance(insuranceAmount);
            // UI will call onInsuranceDecision() when player chooses
        } else {
            // Not enough money for insurance, skip it
            this.hasInsurance = false;
            this.transitionToState(GameState.CHECKING_BLACKJACK);
            this.handleCheckingBlackjack();
        }
    }
    
    onInsuranceDecision(takeInsurance) 
    {
        if (this.currentState !== GameState.OFFERING_INSURANCE) {
            return;
        }
        
        if (takeInsurance) {
            this.insuranceBet = this.currentBet / 2;
            this.bankrollManager.placeBet(this.insuranceBet);
            this.hasInsurance = true;
            this.uiManager.displayMessage("Insurance placed: $" + this.insuranceBet);
        } else {
            this.hasInsurance = false;
        }
        
        this.transitionToState(GameState.CHECKING_BLACKJACK);
        this.handleCheckingBlackjack();
    }
    
    // === CHECKING BLACKJACK ===
    handleCheckingBlackjack() 
    {
        const playerHasBlackjack = this.isBlackjack(this.playerHand);
        const dealerShowsBlackjackPossibility = this.dealerShowsBlackjackPossibility();
        
        // If player has blackjack
        if (playerHasBlackjack) {
            if (dealerShowsBlackjackPossibility) {
                // Check dealer hole card
                const dealerHasBlackjack = this.isBlackjack(this.dealerHand);
                
                // Resolve insurance first if player took it
                if (this.hasInsurance) {
                    this.resolveInsurance(dealerHasBlackjack);
                }
                
                // Reveal dealer hole card
                this.dealerHand.revealHoleCard();
                this.uiManager.displayDealerHand(this.dealerHand);
                
                if (dealerHasBlackjack) {
                    // Push - both have blackjack
                    this.uiManager.displayMessage("Both have Blackjack! Push.");
                    this.transitionToState(GameState.RESOLVING_BETS);
                    this.handlePayout('push');
                } else {
                    // Player wins with blackjack
                    this.uiManager.displayMessage("Blackjack! You win 3:2!");
                    this.transitionToState(GameState.RESOLVING_BETS);
                    this.handlePayout('blackjack');
                }
            } else {
                // Dealer cannot have blackjack
                this.uiManager.displayMessage("Blackjack! You win 3:2!");
                this.transitionToState(GameState.RESOLVING_BETS);
                this.handlePayout('blackjack');
            }
        }
        // Player doesn't have blackjack
        else {
            if (dealerShowsBlackjackPossibility) {
                // Peek at dealer hole card
                const dealerHasBlackjack = this.isBlackjack(this.dealerHand);
                
                // Resolve insurance if player took it
                if (this.hasInsurance) {
                    this.resolveInsurance(dealerHasBlackjack);
                }
                
                if (dealerHasBlackjack) {
                    // Dealer wins immediately
                    this.dealerHand.revealHoleCard();
                    this.uiManager.displayDealerHand(this.dealerHand);
                    this.uiManager.displayMessage("Dealer has Blackjack. You lose.");
                    this.transitionToState(GameState.RESOLVING_BETS);
                    this.handlePayout('loss');
                } else {
                    // No blackjacks, continue to player turn
                    this.transitionToState(GameState.PLAYER_TURN);
                    this.handlePlayerTurn();
                }
            } else {
                // No blackjack possibility, continue to player turn
                this.transitionToState(GameState.PLAYER_TURN);
                this.handlePlayerTurn();
            }
        }
    }
    
    isBlackjack(hand) 
    {
        if (hand.cards.length !== 2) {
            return false;
        }
        
        const hasAce = hand.cards.some(card => card.rank === 'A');
        const hasTenValue = hand.cards.some(card => ['10', 'J', 'Q', 'K'].includes(card.rank));
        
        return hasAce && hasTenValue;
    }
    
    dealerShowsBlackjackPossibility() 
    {
        const dealerUpCard = this.dealerHand.cards[0];
        return dealerUpCard.rank === 'A' || ['10', 'J', 'Q', 'K'].includes(dealerUpCard.rank);
    }
    
    resolveInsurance(dealerHasBlackjack) 
    {
        if (dealerHasBlackjack) {
            // Insurance pays 2:1
            const insurancePayout = this.insuranceBet * 3; // Original bet + 2:1 win
            this.bankrollManager.addToBankroll(insurancePayout);
            this.uiManager.displayMessage("Insurance pays 2:1! Won $" + (this.insuranceBet * 2));
        } else {
            // Insurance loses (already deducted from bankroll)
            this.uiManager.displayMessage("Insurance lost: $" + this.insuranceBet);
        }
        
        this.insuranceBet = 0;
        this.hasInsurance = false;
    }
    
    handlePlayerTurn() 
    {
        this.updateAvailableActions();
    }
    
    updateAvailableActions() 
    {
        const handTotal = this.playerHand.getBestTotal();
        const isBusted = handTotal > 21;
        const canAffordDouble = this.bankrollManager.getBalance() >= this.currentBet;
        const canSplit = this.playerHand.cards.length === 2 && 
                        this.playerHand.cards[0].rank === this.playerHand.cards[1].rank &&
                        this.bankrollManager.getBalance() >= this.currentBet;
        
        this.uiManager.updateActionButtons({
            canHit: !isBusted,
            canStand: !isBusted,
            canDouble: this.playerHand.cards.length === 2 && canAffordDouble && !isBusted,
            canSplit: canSplit
        });
    }
    
    onPlayerAction(action) 
    {
        if (this.currentState !== GameState.PLAYER_TURN) {
            return;
        }
        
        switch(action) {
            case 'hit':
                this.handleHit();
                break;
            case 'stand':
                this.handleStand();
                break;
            case 'double':
                this.handleDouble();
                break;
            case 'split':
                this.handleSplit();
                break;
        }
    }
    
    handleHit() 
    {
        const newCard = this.deckManager.draw();
        this.playerHand.addCard(newCard);
        
        // Add only the new card to display, not all cards
        this.uiManager.addCardToPlayerHand(newCard);
        this.uiManager.updatePlayerTotal(this.playerHand.getBestTotal());
        
        const handTotal = this.playerHand.getBestTotal();
        
        if (handTotal > 21) {
            // Player busted
            this.uiManager.displayMessage("Busted! You lose.");
            this.transitionToState(GameState.RESOLVING_BETS);
            this.handlePayout('bust');
        } else if (handTotal === 21) {
            // Automatically stand on 21
            this.handleStand();
        } else {
            // Update available actions
            this.updateAvailableActions();
        }
    }
    
    async handleStand() 
    {
    this.uiManager.displayMessage("You stand with " + this.playerHand.getBestTotal());
    this.transitionToState(GameState.DEALER_TURN);
    await this.handleDealerTurn();
    }

    async handleDouble() 
    {
        // Double the bet
        this.bankrollManager.placeBet(this.currentBet);
        this.currentBet = this.currentBet * 2;
        this.uiManager.displayBet(this.currentBet);
    
        // Draw one card
        const newCard = this.deckManager.draw();
        this.playerHand.addCard(newCard);
    
        // Add only the new card to display
        this.uiManager.addCardToPlayerHand(newCard);
        this.uiManager.updatePlayerTotal(this.playerHand.getBestTotal());
    
        const handTotal = this.playerHand.getBestTotal();
    
        if (handTotal > 21) {
            // Player busted
            this.uiManager.displayMessage("Busted! You lose.");
            this.transitionToState(GameState.RESOLVING_BETS);
            this.handlePayout('bust');
        } else {
            // Automatically stand after double
            this.uiManager.displayMessage("Doubled down. Standing with " + handTotal);
            this.transitionToState(GameState.DEALER_TURN);
            await this.handleDealerTurn();
        }
    }

    async handleSplit() 
    {
        // TODO: Split functionality
        // This is more complex - we'll implement it later if needed
        this.uiManager.displayMessage("Split not yet implemented");
    }
    
    // === DEALER TURN ===
    async handleDealerTurn() 
    {
        // Reveal dealer hole card
        this.dealerHand.revealHoleCard();
        this.uiManager.displayDealerHand(this.dealerHand);
    
        // Wait a moment before dealer starts drawing
        await this.delay(500);
    
        // Dealer must hit on 16 or less, stand on 17 or more
        await this.dealerDrawCards();
    }
    
    async dealerDrawCards() 
    {
        const DEALER_STAND_VALUE = 17;
        const CARD_DEAL_DELAY = 1000; // 1 second between cards
    
        let dealerTotal = this.dealerHand.getBestTotal();
    
        // Draw cards until dealer reaches 17 or busts
        while (dealerTotal < DEALER_STAND_VALUE) {
        // Wait before drawing next card
            await this.delay(CARD_DEAL_DELAY);
        
            const newCard = this.deckManager.draw();
            this.dealerHand.addCard(newCard);
            this.uiManager.addCardToDealerHand(newCard);
            this.uiManager.updateDealerTotal(this.dealerHand.getBestTotal());

            dealerTotal = this.dealerHand.getBestTotal();
        }
        // Dealer is done drawing
        this.transitionToState(GameState.RESOLVING_BETS);
        this.compareHands();
    }
    
    // === RESOLVING BETS ===
    compareHands() 
    {
        const playerTotal = this.playerHand.getBestTotal();
        const dealerTotal = this.dealerHand.getBestTotal();
        
        if (dealerTotal > 21) {
            // Dealer busted, player wins
            this.uiManager.displayMessage("Dealer busts! You win!");
            this.handlePayout('win');
        } else if (playerTotal > dealerTotal) {
            // Player has higher total
            this.uiManager.displayMessage("You win! " + playerTotal + " vs " + dealerTotal);
            this.handlePayout('win');
        } else if (playerTotal === dealerTotal) {
            // Push - tie
            this.uiManager.displayMessage("Push - it's a tie!");
            this.handlePayout('push');
        } else {
            // Dealer has higher total
            this.uiManager.displayMessage("Dealer wins. " + dealerTotal + " vs " + playerTotal);
            this.handlePayout('loss');
        }
    }
    
    handlePayout(outcome) 
    {
        let payout = 0;
        let message = '';
        let overlayTitle = '';
        let overlayMessage = '';
        let overlayType = '';
    
        const playerTotal = this.playerHand.getBestTotal();
        const dealerTotal = this.dealerHand.getBestTotal();
    
        switch(outcome) 
        {
            case 'blackjack':
                // Player wins 3:2 - gets original bet back + 1.5x bet
                payout = this.currentBet + (this.currentBet * 1.5);
                const blackjackWin = this.currentBet * 1.5;
                message = `Blackjack! You win $${blackjackWin.toFixed(2)}!`;
                overlayTitle = 'BLACKJACK!';
                overlayMessage = `You win $${blackjackWin.toFixed(2)} (3:2 payout)`;
                overlayType = 'blackjack';
                this.bankrollManager.addToBankroll(payout);
                this.bankrollManager.recordWin(blackjackWin);
                break;
            
            case 'win':
                // Player wins 1:1 - gets original bet back + 1x bet
                payout = this.currentBet * 2;
                message = `You win $${this.currentBet.toFixed(2)}!`;
                overlayTitle = 'YOU WIN!';
                overlayMessage = `$${this.currentBet.toFixed(2)} • Player: ${playerTotal} vs Dealer: ${dealerTotal}`;
                overlayType = 'win';
                this.bankrollManager.addToBankroll(payout);
                this.bankrollManager.recordWin(this.currentBet);
                break;
            
            case 'push':
                // Return original bet only
                payout = this.currentBet;
                message = 'Push - Bet returned';
                overlayTitle = 'PUSH';
                overlayMessage = `Tie at ${playerTotal} • Bet returned`;
                overlayType = 'push';
                this.bankrollManager.addToBankroll(payout);
                this.bankrollManager.recordPush();
                break;
            
            case 'bust':
                // Player loses - bet already deducted, no payout
                payout = 0;
                message = `Busted! You lose $${this.currentBet.toFixed(2)}`;
                overlayTitle = 'BUSTED!';
                overlayMessage = `Lost $${this.currentBet.toFixed(2)} • Over 21`;
                overlayType = 'bust';
                this.bankrollManager.recordLoss(this.currentBet);
                break;
            
            case 'loss':
                // Dealer wins - bet already deducted, no payout
                payout = 0;
                message = `You lose $${this.currentBet.toFixed(2)}`;
                overlayTitle = 'DEALER WINS';
                overlayMessage = `Lost $${this.currentBet.toFixed(2)} • Player: ${playerTotal} vs Dealer: ${dealerTotal}`;
                overlayType = 'lose';
                this.bankrollManager.recordLoss(this.currentBet);
                break;
        }
    
        // Update UI with payout message
        this.uiManager.displayMessage(message);
        this.uiManager.displayBankroll(this.bankrollManager.getBalance());
    
        // Show dramatic overlay
        this.uiManager.showOverlay(overlayType, overlayTitle, overlayMessage);
    
        // Move to round complete after overlay duration
        setTimeout(() => {
        this.transitionToState(GameState.ROUND_COMPLETE);
        this.handleRoundComplete();
        }, 2500); // Match the overlay duration
    }
    
    handleRoundComplete() 
    {
        // Store the last bet for repeat bet feature
        this.lastBet = this.currentBet;

        // Reset for next round
        this.currentBet = 0;
        this.insuranceBet = 0;
        this.hasInsurance = false;

    
        // Check if player has money left
        if (this.bankrollManager.getBalance() <= 0) {
        this.uiManager.displayMessage("Out of money! Game Over.");
        return;
        }
    
        // Clear the hands from UI
        this.uiManager.clearAllHands();
    
        // Enable betting for next round
        this.transitionToState(GameState.WAITING_FOR_BET);
        this.uiManager.enableBetting();
    
        // Update repeat bet button state
        const canRepeat = this.canRepeatBet();
        this.uiManager.updateRepeatBetButton(canRepeat, this.lastBet);
    
        this.uiManager.displayMessage("Place your bet for the next round");
    }

    // === STATE MANAGEMENT ===
    transitionToState(newState) 
    {
        this.currentState = newState;
        this.uiManager.updateGameState(newState);
    }
    delay(milliseconds) 
    {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}