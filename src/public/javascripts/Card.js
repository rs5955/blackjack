class Card {
  constructor(rank, suit) {
    this.rank = rank; //2-10, J, Q, K, A
    this.suit = suit; //0-3 (0:heart,1:diamond,2:spade,3:club)
  }
  //to check for card equality
  equals(card2) {
    return this.rank === card2.rank && this.suit === card2.suit;
  }
}