class Deck {
  //52 cards
  //13 ranks: 2-10, jack(J), queen(Q), king(K), ace(A)
  //4 suits: hearts(0),diamonds(1),spades(2), clubs(3) (13 ea.)
  //diamond&hearts are red, spades&clubs are black
  constructor() {
    this.cards = []; //the deck
    //populate deck with 52 unique cards
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = [0, 1, 2, 3];
    ranks.forEach(r => {
      suits.forEach(s => {
        this.cards.push(new Card(r, s));
      });
    });
    //shuffle deck
    this.shuffle();
  }
  shuffle() {
    for (let i = this.size() - 1; i > 0; i--) { //from n-1 -> 1
      const j = Math.floor(Math.random() * (i + 1)); //j: 0<=j<=i
      const temp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = temp;
    }
  }
  //add the provided starting values
  addStart(startSeq) {
    const toAdd = [...startSeq];
    const removedCards = [];

    //pull any card from cards with rank in startSeq
    for (let j = startSeq.length - 1; j >= 0; j--) {
      for (let i = this.size() - 1; i >= 0; i--) {
        if (this.cards[i].rank === startSeq[j]) {
          //remove cards[i] and startSeq[j]
          removedCards.push(this.cards[i]);
          this.cards.splice(i, 1);
          startSeq.splice(j, 1);
        }
      }
    }

    for (let i = toAdd.length - 1; i >= 0; i--) {
      for (let j = removedCards.length - 1; j >= 0; j--) {
        if (removedCards[j].rank === toAdd[i]) {
          this.cards.unshift(removedCards[j]);
          toAdd.splice(i, 1);
          removedCards.splice(j, 1);
        }
      }
    }

  }

  size() {
    return this.cards.length;
  }
}