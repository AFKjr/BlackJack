// Initialize all managers
const deckManager = new DeckManager(6); // 6-deck shoe
const handManager = new HandManager();
const bankrollManager = new BankrollManager(1000); // Start with $1000
const cardDesign = new CardDesign();
const uiManager = new UIManager(cardDesign);

// Initialize game state manager with all dependencies
let gameStateManager;

// Set up event listeners
function initializeGame() {
    // Create gameStateManager after DOM is loaded
    gameStateManager = new GameStateManager(
        deckManager,
        handManager,
        bankrollManager,
        uiManager
    );
    
    setupBettingControls();
    setupActionButtons();
    setupNewGameButton();
    
    // Display initial bankroll
    uiManager.displayBankroll(bankrollManager.getBalance());
}

function setupBettingControls() {
    // Betting chip buttons
    const chip1 = document.getElementById('chip-1');
    const chip5 = document.getElementById('chip-5');
    const chip25 = document.getElementById('chip-25');
    const chip100 = document.getElementById('chip-100');
    const clearBetButton = document.getElementById('clear-bet');
    const dealButton = document.getElementById('deal-button');
    
    let currentBet = 0;
    
    chip1.addEventListener('click', () => {
        currentBet += 1;
        updateBetDisplay(currentBet);
    });
    
    chip5.addEventListener('click', () => {
        currentBet += 5;
        updateBetDisplay(currentBet);
    });
    
    chip25.addEventListener('click', () => {
        currentBet += 25;
        updateBetDisplay(currentBet);
    });
    
    chip100.addEventListener('click', () => {
        currentBet += 100;
        updateBetDisplay(currentBet);
    });
    
    clearBetButton.addEventListener('click', () => {
        currentBet = 0;
        updateBetDisplay(currentBet);
    });
    
    dealButton.addEventListener('click', () => {
        if (currentBet === 0) {
            uiManager.displayMessage("Please place a bet first");
            return;
        }
        
        try {
            gameStateManager.handleBetting(currentBet);
            gameStateManager.onDealButtonClick();
            currentBet = 0;
        } catch (error) {
            uiManager.displayMessage(error.message);
        }
    });
    
    function updateBetDisplay(amount) {
        document.getElementById('bet-amount').textContent = amount;
        
        // Validate bet against balance
        if (amount > bankrollManager.getBalance()) {
            uiManager.displayMessage("Bet exceeds available funds");
        }
    }
}

function setupActionButtons() {
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const doubleButton = document.getElementById('double-button');
    const splitButton = document.getElementById('split-button');
    
    hitButton.addEventListener('click', () => {
        gameStateManager.onPlayerAction('hit');
    });
    
    standButton.addEventListener('click', () => {
        gameStateManager.onPlayerAction('stand');
    });
    
    doubleButton.addEventListener('click', () => {
        gameStateManager.onPlayerAction('double');
    });
    
    splitButton.addEventListener('click', () => {
        gameStateManager.onPlayerAction('split');
    });
}

function setupNewGameButton() {
    const newGameButton = document.getElementById('new-game');
    
    newGameButton.addEventListener('click', () => {
        const confirmed = confirm('Start a new game? This will reset your bankroll.');
        if (confirmed) {
            resetGame();
        }
    });
}

function resetGame() {
    // Reset all managers
    deckManager.initializeShoe();
    handManager.clearAllHands();
    bankrollManager.reset();
    
    // Reset UI
    uiManager.clearAllHands();
    uiManager.displayBankroll(bankrollManager.getBalance());
    uiManager.displayMessage("New game started. Place your bet!");
    
    // Reset game state
    gameStateManager.transitionToState(GameState.WAITING_FOR_BET);
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    uiManager.displayMessage("Welcome to Blackjack! Place your bet to begin.");
});