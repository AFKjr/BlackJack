class CardDesign {
    constructor() 
    {
        // No need to store card reference, we'll pass it to methods
    }
    
    renderCard(card) 
    {
        // Your existing function, slightly modified
        const cardDesign = document.createElement('div');
        cardDesign.className = 'card';
        cardDesign.dataset.rank = card.rank;
        cardDesign.dataset.suit = card.suit.id;
        // cardDesign.title = this.getDisplayName(card);
        
        // If card is face down, show back
        if (card.isFaceDown) 
        {
            cardDesign.classList.add('face-down');
            const backDesign = this.createCardBack();
            cardDesign.appendChild(backDesign);
            return cardDesign;
        }
        
        // top-left corner
        const top = document.createElement('div');
        top.className = 'corner top';
        top.textContent = card.rank + '\n' + card.suit.symbol;
        
        // center suit large
        const center = document.createElement('div');
        center.className = 'center-suit';
        center.textContent = card.suit.symbol;
        
        // bottom-right corner (rotated)
        const bottom = document.createElement('div');
        bottom.className = 'corner bottom';
        bottom.textContent = card.rank + '\n' + card.suit.symbol;
        
        cardDesign.appendChild(top);
        cardDesign.appendChild(center);
        cardDesign.appendChild(bottom);
        
        // style red suits
        if (card.suit.id === 'hearts' || card.suit.id === 'diamonds') {
            cardDesign.classList.add('red');
        }
        
        return cardDesign;
    }
    
    createCardBack() 
    {
        // Creates the back design for face-down cards
        const backDesign = document.createElement('div');
        backDesign.className = 'card-back';
        
        // Simple pattern for card back
        const pattern = document.createElement('div');
        pattern.className = 'back-pattern';
        pattern.textContent = '🂠'; // Card back symbol
        
        backDesign.appendChild(pattern);
        return backDesign;
    }
    
    dealCard(card, targetContainer, delay = 0) 
    {
        // Animates dealing a card to a container
        const cardElement = this.renderCard(card);
        
        // Start position (off-screen or from deck)
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateY(-100px) scale(0.8)';
        
        // Add to container
        targetContainer.appendChild(cardElement);
        
        // Animate into position after delay
        setTimeout(() => {
            cardElement.style.transition = 'all 0.3s ease-out';
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'translateY(0) scale(1)';
        }, delay);
        
        return cardElement;
    }
    
    flipCard(cardElement, card) 
    {
        // Animates flipping a card from face-down to face-up
        return new Promise((resolve) => {
            // Add flipping class to trigger animation
            cardElement.classList.add('flipping');
            
            // Wait for half the flip animation
            setTimeout(() => {
                // Change card content at midpoint of flip
                if (card.isFaceDown) {
                    // Flipping to show back
                    cardElement.classList.add('face-down');
                    const backDesign = this.createCardBack();
                    this.replaceCardContent(cardElement, backDesign);
                } else {
                    // Flipping to show face
                    cardElement.classList.remove('face-down');
                    this.updateCardFace(cardElement, card);
                }
            }, 150); // Half of 300ms flip animation
            
            // Remove flipping class after animation completes
            setTimeout(() => {
                cardElement.classList.remove('flipping');
                resolve();
            }, 300);
        });
    }
    
    updateCardFace(cardElement, card) 
    {
        // Updates card element to show the face
        const top = document.createElement('div');
        top.className = 'corner top';
        top.textContent = card.rank + '\n' + card.suit.symbol;
        
        const center = document.createElement('div');
        center.className = 'center-suit';
        center.textContent = card.suit.symbol;
        
        const bottom = document.createElement('div');
        bottom.className = 'corner bottom';
        bottom.textContent = card.rank + '\n' + card.suit.symbol;
        
        this.replaceCardContent(cardElement, top, center, bottom);
        
        // Update color
        if (card.suit.id === 'hearts' || card.suit.id === 'diamonds') {
            cardElement.classList.add('red');
        } else {
            cardElement.classList.remove('red');
        }
        
        // Update data attributes
        cardElement.dataset.rank = card.rank;
        cardElement.dataset.suit = card.suit.id;
        cardElement.title = this.getDisplayName(card);
    }
    
    replaceCardContent(cardElement, ...newChildren) 
    {
        // Safely replaces card content
        if (typeof cardElement.replaceChildren === 'function') {
            cardElement.replaceChildren(...newChildren);
        } else {
            while (cardElement.firstChild) {
                cardElement.removeChild(cardElement.firstChild);
            }
            newChildren.forEach(child => cardElement.appendChild(child));
        }
    }
    
    dealMultipleCards(cards, targetContainers, delayBetweenCards = 200) 
    {
        // Deals multiple cards with staggered timing
        // cards: array of card objects
        // targetContainers: array of container elements (same length as cards)
        const cardElements = [];
        
        cards.forEach((card, index) => {
            const container = targetContainers[index];
            const delay = index * delayBetweenCards;
            const cardElement = this.dealCard(card, container, delay);
            cardElements.push(cardElement);
        });
        
        return cardElements;
    }
    
    async revealDealerHoleCard(cardElement, card) 
    {
        // Specifically for revealing dealer's hole card with dramatic effect
        await this.flipCard(cardElement, card);
    }
    
    getDisplayName(card) 
    {
        const rankNames = {
            'A': 'Ace',
            '2': 'Two',
            '3': 'Three',
            '4': 'Four',
            '5': 'Five',
            '6': 'Six',
            '7': 'Seven',
            '8': 'Eight',
            '9': 'Nine',
            '10': 'Ten',
            'J': 'Jack',
            'Q': 'Queen',
            'K': 'King'
        };
        
        const suitNames = {
            'spades': 'Spades',
            'hearts': 'Hearts',
            'clubs': 'Clubs',
            'diamonds': 'Diamonds'
        };
        
        return rankNames[card.rank] + ' of ' + suitNames[card.suit.id];
    }
    
    renderDeck(deck, container) 
    {
        // Your existing function
        if (typeof container.replaceChildren === 'function') {
            container.replaceChildren();
        } else {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
        
        deck.forEach(card => {
            container.appendChild(this.renderCard(card));
        });
    }
}