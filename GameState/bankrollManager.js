class BankrollManager {
    constructor(initialBalance = 1000) {
        this.balance = initialBalance;
        this.initialBalance = initialBalance;
        this.totalBetsPlaced = 0;
        this.totalWinnings = 0;
        this.totalLosses = 0;
        this.handsPlayed = 0;
        this.handsWon = 0;
        this.handsLost = 0;
        this.handsPushed = 0;
    }
    
    getBalance() {
        return this.balance;
    }
    
    placeBet(betAmount) {
        if (betAmount <= 0) {
            throw new Error('Bet amount must be positive');
        }
        
        if (betAmount > this.balance) {
            throw new Error('Insufficient funds for bet');
        }
        
        this.balance -= betAmount;
        this.totalBetsPlaced += betAmount;
        
        return this.balance;
    }
    
    addToBankroll(amount) {
        if (amount < 0) {
            throw new Error('Amount to add must be non-negative');
        }
        
        this.balance += amount;
        return this.balance;
    }
    
    recordWin(winAmount) {
        this.totalWinnings += winAmount;
        this.handsWon++;
        this.handsPlayed++;
    }
    
    recordLoss(lossAmount) {
        this.totalLosses += lossAmount;
        this.handsLost++;
        this.handsPlayed++;
    }
    
    recordPush() {
        this.handsPushed++;
        this.handsPlayed++;
    }
    
    getNetProfit() {
        return this.balance - this.initialBalance;
    }
    
    getWinRate() {
        if (this.handsPlayed === 0) {
            return 0;
        }
        return (this.handsWon / this.handsPlayed) * 100;
    }
    
    getStatistics() {
        return {
            currentBalance: this.balance,
            initialBalance: this.initialBalance,
            netProfit: this.getNetProfit(),
            totalBetsPlaced: this.totalBetsPlaced,
            totalWinnings: this.totalWinnings,
            totalLosses: this.totalLosses,
            handsPlayed: this.handsPlayed,
            handsWon: this.handsWon,
            handsLost: this.handsLost,
            handsPushed: this.handsPushed,
            winRate: this.getWinRate().toFixed(2) + '%'
        };
    }
    
    reset(newBalance = null) {
        // Reset bankroll to initial or specified amount
        this.balance = newBalance !== null ? newBalance : this.initialBalance;
        this.totalBetsPlaced = 0;
        this.totalWinnings = 0;
        this.totalLosses = 0;
        this.handsPlayed = 0;
        this.handsWon = 0;
        this.handsLost = 0;
        this.handsPushed = 0;
    }
    
    canAffordBet(betAmount) {
        return this.balance >= betAmount;
    }
    
    isBroke() {
        return this.balance <= 0;
    }
    
    addFunds(amount) {
        if (amount <= 0) {
            throw new Error('Amount to add must be positive');
        }
        
        this.balance += amount;
        this.initialBalance += amount;
        return this.balance;
    }
}