class UIManager 
{
    constructor(cardDesign) 
    {
        this.cardDesign = cardDesign;
        
        // Cache DOM elements
        this.playerHandContainer = document.getElementById('player-hand');
        this.dealerHandContainer = document.getElementById('dealer-hand');
        this.messageDisplay = document.getElementById('game-message');
        this.bankrollDisplay = document.getElementById('bankroll-amount');
        this.betDisplay = document.getElementById('bet-amount');
        this.playerTotalDisplay = document.getElementById('player-total');
        this.dealerTotalDisplay = document.getElementById('dealer-total');
        
        // Action buttons
        this.hitButton = document.getElementById('hit-button');
        this.standButton = document.getElementById('stand-button');
        this.doubleButton = document.getElementById('double-button');
        this.splitButton = document.getElementById('split-button');
        
        // Betting controls
        this.dealButton = document.getElementById('deal-button');
        this.repeatBetButton = document.getElementById('repeat-bet');
        this.bettingChips = document.querySelectorAll('.betting-chip');
    }
    
    displayPlayerHand(hand) 
    {
        this.clearContainer(this.playerHandContainer);
        
        hand.cards.forEach((card, index) => {
            const delay = index * 200; // Stagger card dealing
            this.cardDesign.dealCard(card, this.playerHandContainer, delay);
        });
        
        this.updatePlayerTotal(hand.getBestTotal());
    }
    
    addCardToPlayerHand(card) 
    {
        // Add a single card without clearing existing cards
        this.cardDesign.dealCard(card, this.playerHandContainer, 0);
        // Note: Total will be updated separately
    }
    
    displayDealerHand(hand) 
    {
        this.clearContainer(this.dealerHandContainer);
        
        hand.cards.forEach((card, index) => {
            const delay = index * 200;
            this.cardDesign.dealCard(card, this.dealerHandContainer, delay);
        });
        
        // Only show visible total (face-up cards)
        this.updateDealerTotal(hand.getVisibleTotal());
    }
    
    addCardToDealerHand(card) 
    {
        // Add a single card without clearing existing cards
        this.cardDesign.dealCard(card, this.dealerHandContainer, 100);
        // Note: Total will be updated separately
    }
    
    updatePlayerTotal(total) 
    {
        this.playerTotalDisplay.textContent = total;
        
        if (total > 21) {
            this.playerTotalDisplay.classList.add('busted');
        } else {
            this.playerTotalDisplay.classList.remove('busted');
        }
        
        if (total === 21) {
            this.playerTotalDisplay.classList.add('twenty-one');
        } else {
            this.playerTotalDisplay.classList.remove('twenty-one');
        }
    }
    
    updateDealerTotal(total) 
    {
        this.dealerTotalDisplay.textContent = total;
        
        if (total > 21) {
            this.dealerTotalDisplay.classList.add('busted');
        } else {
            this.dealerTotalDisplay.classList.remove('busted');
        }
        
        if (total === 21) {
            this.dealerTotalDisplay.classList.add('twenty-one');
        } else {
            this.dealerTotalDisplay.classList.remove('twenty-one');
        }
    }
    
    clearContainer(container) 
    {
        if (typeof container.replaceChildren === 'function') {
            container.replaceChildren();
        } else {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    }
    
    clearAllHands() 
    {
        this.clearContainer(this.playerHandContainer);
        this.clearContainer(this.dealerHandContainer);
        this.playerTotalDisplay.textContent = '0';
        this.dealerTotalDisplay.textContent = '0';
    }
    
    displayMessage(message) 
    {
        this.messageDisplay.textContent = message;
        
        // Add animation class
        this.messageDisplay.classList.remove('message-fade-in');
        void this.messageDisplay.offsetWidth; // Force reflow
        this.messageDisplay.classList.add('message-fade-in');
    }
    
    displayBankroll(amount) 
    {
        this.bankrollDisplay.textContent = amount.toFixed(2);
        
        // Add pulse animation on change
        this.bankrollDisplay.classList.remove('amount-change');
        void this.bankrollDisplay.offsetWidth;
        this.bankrollDisplay.classList.add('amount-change');
    }
    
    displayBet(amount) 
    {
        this.betDisplay.textContent = amount.toFixed(2);
    }
    
    updateActionButtons(availableActions) 
    {
        this.hitButton.disabled = !availableActions.canHit;
        this.standButton.disabled = !availableActions.canStand;
        this.doubleButton.disabled = !availableActions.canDouble;
        this.splitButton.disabled = !availableActions.canSplit;
        
        // Add visual feedback
        this.toggleButtonState(this.hitButton, availableActions.canHit);
        this.toggleButtonState(this.standButton, availableActions.canStand);
        this.toggleButtonState(this.doubleButton, availableActions.canDouble);
        this.toggleButtonState(this.splitButton, availableActions.canSplit);
    }
    
    toggleButtonState(button, enabled) 
    {
        if (enabled) {
            button.classList.remove('disabled');
            button.classList.add('enabled');
        } else {
            button.classList.remove('enabled');
            button.classList.add('disabled');
        }
    }
    
    enableDealButton() 
    {
        this.dealButton.disabled = false;
        this.dealButton.classList.add('enabled');
    }
    
    disableDealButton() 
    {
        this.dealButton.disabled = true;
        this.dealButton.classList.remove('enabled');
    }
    
    enableBetting() 
    {
        this.bettingChips.forEach(chip => {
        chip.disabled = false;
    });
        this.enableDealButton();
    }
    
    disableBetting() 
    {
        this.bettingChips.forEach(chip => {
            chip.disabled = true;
        });
        this.disableDealButton();
        this.repeatBetButton.disabled = true;
    }

    updateRepeatBetButton(canRepeat, lastBet = 0) 
    {
        if (canRepeat) 
        {
            this.repeatBetButton.disabled = false;
            this.repeatBetButton.textContent = `Repeat Bet ($${lastBet})`;
            this.repeatBetButton.title = `Place $${lastBet} bet and deal`;
        } else 
        {
            this.repeatBetButton.disabled = true;
            this.repeatBetButton.textContent = 'Repeat Bet';
            this.repeatBetButton.title = 'No previous bet or insufficient funds';
        }
    }
    
    offerInsurance(insuranceAmount) 
    {
        const message = `Dealer shows Ace. Insurance costs $${insuranceAmount}. Take insurance?`;
        this.displayMessage(message);
        
        // Show insurance buttons
        const insuranceYes = document.getElementById('insurance-yes');
        const insuranceNo = document.getElementById('insurance-no');
        
        insuranceYes.style.display = 'inline-block';
        insuranceNo.style.display = 'inline-block';
        
        // These buttons should be wired up in the game.js file
    }
    
    hideInsuranceButtons() 
    {
        document.getElementById('insurance-yes').style.display = 'none';
        document.getElementById('insurance-no').style.display = 'none';
    }
    
    updateGameState(state) 
    {
        // Update UI based on current game state
        switch(state) {
            case GameState.WAITING_FOR_BET:
                this.enableBetting();
                this.updateActionButtons({
                    canHit: false,
                    canStand: false,
                    canDouble: false,
                    canSplit: false
                });
                break;
                
            case GameState.DEALING_CARDS:
                this.disableBetting();
                break;
                
            case GameState.OFFERING_INSURANCE:
                // Insurance buttons will be shown by offerInsurance()
                break;
                
            case GameState.PLAYER_TURN:
                this.hideInsuranceButtons();
                // Action buttons will be updated by updateActionButtons()
                break;
                
            case GameState.DEALER_TURN:
                this.updateActionButtons({
                    canHit: false,
                    canStand: false,
                    canDouble: false,
                    canSplit: false
                });
                break;
                
            case GameState.RESOLVING_BETS:
                // All buttons disabled during resolution
                break;
                
            case GameState.ROUND_COMPLETE:
                // Prepare for next round
                break;
        }
    }

    showOverlay(type, title, message, duration = 2500) 
    {
        const overlay = document.getElementById('game-overlay');
        const overlayTitle = overlay.querySelector('.overlay-title');
        const overlayMessage = overlay.querySelector('.overlay-message');
    
        // Remove all previous type classes
        overlay.classList.remove('win', 'lose', 'push', 'bust', 'blackjack', 'hidden');
    
        // Add the appropriate type class
        overlay.classList.add(type);
    
        // Set content
        overlayTitle.textContent = title;
        overlayMessage.textContent = message;
    
        // Show overlay
        overlay.classList.remove('hidden');
    
        // Auto-hide after duration
        setTimeout(() => {
            this.hideOverlay();
        }, duration);
    }

    hideOverlay() 
    {
        const overlay = document.getElementById('game-overlay');
        overlay.classList.add('hidden');
    }   
}