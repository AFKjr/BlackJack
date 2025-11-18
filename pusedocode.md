When a game starts; 
    Alert user to place bet;
        If a bet is placed then; 
            Initialize or reshuffle deck/shoe as needed;
            Deal Cards or clear bet; 
        If no bet is placed; 
            Wait for bet;
    When bet is placed and deal cards is placed;
        Deal initial cards;
            Player gets card 1 face-up;
            Dealer gets card 1 face-up;
            Player gets card 2 face-up; // initial total visible to player
            Dealer gets card 2 face-down; // dealer shows only one face-up card

        Determine initial outcomes;
            playerHasBlackjack = (playerHand.count == 2 and playerHand.bestTotal() == 21);
            dealerShowsAceOr10 = (dealerHand.faceUp().isAce() or dealerHand.faceUp().isTenValue());

        If dealerShowsAceOr10;
            Check dealer hole card for Blackjack immediately (before player actions) if using early check rules;
                If dealerHand.bestTotal() == 21;
                    If playerHasBlackjack;
                        Push; return player's bet;
                    Else;
                        Dealer has Blackjack; player loses (resolve insurance if offered);
                Else;
                    If playerHasBlackjack;
                        Payout blackjack (default 3:2); go to round end;
                    Else;
                        Continue to player action step;

        Else; // dealer not showing ace/10
            If playerHasBlackjack;
                Payout blackjack (default 3:2); go to round end;
            Else;
                Continue to player action step;

    Player action step; // for each hand (normal or split)
        For each playerHand;
            While playerHand.notStanding and playerHand.bestTotal() <= 21;
                Offer actions (Hit; Stand; Double - if allowed; Split - if first two cards match rank; Surrender - if house allows);
                If player chooses Split;
                    Create new hands from pair; duplicate bet to new hand; apply split house rules (e.g., Aces one-card rule);
                    Move to next hand in loop;
                If player chooses Double;
                    Double the bet for this hand;
                    playerHand.add(draw()); // one card only
                    playerHand.stand(); // auto-stand after double
                If player chooses Hit;
                    playerHand.add(draw());
                    If playerHand.bestTotal() > 21;
                        Player busts; stop actions for this hand; record loss for this hand;
                If player chooses Stand;
                    playerHand.stand();

    Dealer action step; // only if any player hands remain not-busted
        Reveal dealer hole card;
        While dealerHand.bestTotal() < 17 OR (houseRuleHitSoft17 and dealerHand.isSoft17());
            dealerHand.add(draw());
        If dealerHand.bestTotal() > 21;
            Dealer busts; all non-busted player hands win;

    Compare results and payout; // for each player hand compared to dealer
        For each playerHand;
            playerTotal = playerHand.bestTotal();
            dealerTotal = dealerHand.bestTotal();
            If playerHand.busted;
                Player loses bet for this hand;
            Else if dealerHand.busted;
                Player wins bet (1:1, doubling affects total winnings);
            Else if playerTotal > dealerTotal;
                Player wins bet (1:1, natural blackjack handled earlier);
            Else if playerTotal == dealerTotal;
                Push; return bet;
            Else;
                Player loses;

    Insurance handling;
        If player took insurance when dealer face-up Ace;
            If dealer had Blackjack;
                Pay 2:1 insurance; adjust main bet outcome accordingly;
            Else;
                Player loses the insurance bet;

    Round cleanup;
        Clear hands;
        Deduct and credit bankroll based on payouts;
        Reshuffle shoe if below threshold;
        Prompt player for next bet;

Core rules and helper notes;
    // Ace handling for totals: treat Ace as 11 when it does not cause bust, otherwise treat as 1;
    bestTotal(hand):
        sum = sum of card values treating Ace as 1;
        aces = count of Aces;
        While aces > 0 and sum + 10 <= 21;
            sum += 10;
            aces -= 1;
        return sum;

    // House rules to configure:
    // - Blackjack payout (usually 3:2 but may be 6:5 house rule);
    // - Dealer soft-17 rule (Hit soft-17 or Stand soft-17);
    // - Double after split allowed or not;
    // - Resplitting allowed or not;
    // - Surrender (early or late) allowed or not;
    // - Number of decks in shoe and shuffle threshold;

Edge cases & best practices;
    // - Immediate player loss if busts during hits; dealer doesn't play further for that hand.
    // - Dealer's Blackjack check must be done early if dealer shows Ace or 10; otherwise player might take actions unnecessarily.
    // - For split hands, process each hand separately; dealer plays only after all player hands resolve.
    // - Keep `bestTotal()` as a single function to avoid inconsistent Ace logic.
    // - Implement tests for Aces, blackjack, split, double, insurance, and soft-17 plays.
