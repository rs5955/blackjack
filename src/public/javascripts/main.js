/*
Raymond Shi (rs5955)
Assignment 6 - One Hand of Blackjack
*/

//------Card class------
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

//------Deck class------
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
  //run durstenfeld shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
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
//------END CLASSES------
//Add a new card to either the computer or player hand
function addCard(card, user) { //user = computer(0) or player(1)
  const suits = ['♥', '♦', '♠', '♣'];
  const toAdd = document.createElement('div');
  toAdd.classList.add('card');
  //give card a random rotation: -5<deg<5
  const deg = Math.random() * 10 - 5;
  toAdd.style.transform = `rotate(${deg}deg)`;

  const txt1 = document.createElement('div');
  txt1.classList.add('cardInfoL');
  const txt2 = document.createElement('div');
  txt2.classList.add('cardInfoR');
  if (card.suit <= 1) {
    txt1.classList.add('redTxt');
    txt2.classList.add('redTxt');
  }
  txt1.appendChild(document.createTextNode(card.rank + suits[card.suit]));
  txt2.appendChild(document.createTextNode(card.rank + suits[card.suit]));

  toAdd.appendChild(txt1);
  toAdd.appendChild(txt2);
  if (user === 0) {
    //computer
    document.querySelector('#compHand').appendChild(toAdd);
  } else if (user === 1) {
    //player
    document.querySelector('#playerHand').appendChild(toAdd);
  }
}

//calculate total based on current hand
function calcTotal(cards) {
  let aces = 0;

  let sum = cards.reduce((a, c) => {
    const faceCards = ['J', 'Q', 'K'];
    if (faceCards.includes(c.rank)) {
      return a + 10;
    } else if (c.rank === 'A') {
      aces++;
      return a + 11;
    } else {
      return a + parseInt(c.rank);
    }
  }, 0);

  //min/max sum
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

//update html elements to represent new total
function updateTotal(cards, user) { //user = computer(0) or player(1)
  const total = calcTotal(cards);
  //replace previous textnode with new textnode containing updated score
  if (user === 0) { //computer
    const toAdd = document.createTextNode('Computer Hand | Total: ' + total);
    const selector = document.querySelector('#compLabel');
    selector.removeChild(selector.firstChild);
    selector.appendChild(toAdd);
  } else if (user === 1) { //player
    const toAdd = document.createTextNode('Player Hand | Total: ' + total);
    const selector = document.querySelector('#playerLabel');
    selector.removeChild(selector.firstChild);
    selector.appendChild(toAdd);
  }
}

//get the scores from the database and print them in the table
function getScores() {
  const req = new XMLHttpRequest();

  req.open('GET', 'api/results', false);
  req.addEventListener('load', () => {

    if (req.status >= 200 && req.status < 300) {
      const results = JSON.parse(req.responseText);

      //pad array with empty data
      while (results.length < 5) {
        results.push({
          computer: '-',
          player: '-',
          initials: '-'
        });
      }
      //build a table row for entry
      for (const r of results) {
        const history = document.querySelector('#history');
        const row = document.createElement('tr');
        const compData = document.createElement('td');
        compData.appendChild(document.createTextNode(r.computer));
        const playerData = document.createElement('td');
        playerData.appendChild(document.createTextNode(r.player));
        const initData = document.createElement('td');
        initData.appendChild(document.createTextNode(r.initials));

        row.appendChild(compData);
        row.appendChild(playerData);
        row.appendChild(initData);

        history.appendChild(row);
      }
    }
  });
  req.send();
}

//save score to database
function saveScore(compTotal, playerTotal, init) {
  const req = new XMLHttpRequest();

  req.open('POST', 'api/results', false);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  req.addEventListener('load', function() {
    //    console.log('from listener:',req.status,req.responseText);
  });
  req.send('computer=' + compTotal + '&player=' + playerTotal + '&initials=' + init);

  getScores();
}

//handle score saving
function handleSave(compTotal, playerTotal, evt) {
  evt.preventDefault();
  const initials = document.querySelector('#initials').value;

  document.querySelector('#saveForm').style.display = 'none';

  const saveMsg = document.createElement('p');
  saveMsg.id = 'saveMsg';
  saveMsg.appendChild(document.createTextNode('Last 5 Hands:'));
  document.querySelector('.game').appendChild(saveMsg);

  //show table of last 5 hands
  const history = document.createElement('table');
  history.id = 'history';
  document.querySelector('.game').appendChild(history);

  //create header row
  const row1 = document.createElement('tr');
  const r1h1 = document.createElement('th');
  r1h1.appendChild(document.createTextNode('Computer'));
  row1.appendChild(r1h1);
  const r1h2 = document.createElement('th');
  r1h2.appendChild(document.createTextNode('Player'));
  row1.appendChild(r1h2);
  const r1h3 = document.createElement('th');
  r1h3.appendChild(document.createTextNode('Initials'));
  row1.appendChild(r1h3);
  history.appendChild(row1);

  saveScore(compTotal, playerTotal, initials);

  document.querySelector('#restart').style.display = 'inline-block';
}

function reset() {
  //clear game div
  const gameDiv = document.querySelector('.game');
  while (gameDiv.firstChild) {
    gameDiv.removeChild(gameDiv.lastChild);
  }

  handleClick();
}

//call when player loses or stands
function endGame(player, computer, deck) {
  document.querySelector('#buttons').style.display = 'none';

  //computer strategy
  while (calcTotal(computer, 0) < 18) {
    const next = deck.cards[0];
    deck.cards.shift();
    computer.push(next);
    addCard(next, 0);
  }
  updateTotal(computer, 0);

  //delete current hand for computer
  const compHand = document.querySelector('#compHand');
  while (compHand.firstChild) {
    compHand.removeChild(compHand.lastChild);
  }

  //swap computer[0] with computer[1]
  const c1 = computer[0];
  const temp = computer[1];
  computer[1] = c1;
  computer[0] = temp;

  //add all the cards to computer hand
  computer.forEach(c => {
    addCard(c, 0);
  });

  const playerTotal = calcTotal(player, 1);
  const compTotal = calcTotal(computer, 0);

  //equals true if total>21, false otherwise
  const playerLost = playerTotal > 21;
  const compLost = compTotal > 21;
  let winner;

  if (playerLost && compLost) {
    winner = 'No Winner 😑😑😑';
  } else if (playerLost) {
    winner = 'Computer Won 😢😢😢';
  } else if (compLost) {
    winner = 'Player Won 💰💰💰';
  } else if (playerTotal === compTotal) {
    winner = 'Tie 😐😐😐';
  } else {
    winner = 21 - playerTotal < 21 - compTotal ? 'Player Won 💰💰💰' : 'Computer Won 😢😢😢';
  }

  const winnerDiv = document.createElement('div');
  winnerDiv.id = 'winnerDiv';
  winnerDiv.appendChild(document.createTextNode(winner));

  const gameDiv = document.querySelector('.game');
  const restartBtn = document.createElement('button');
  restartBtn.id = 'restart';
  restartBtn.appendChild(document.createTextNode('Restart'));
  restartBtn.addEventListener('click', reset);
  restartBtn.style.display = 'none';

  const endContainer = document.createElement('div');
  endContainer.id = 'end';
  endContainer.appendChild(winnerDiv);
  endContainer.appendChild(restartBtn);
  gameDiv.appendChild(endContainer);

  //form to save to database
  const saveForm = document.createElement('form');
  saveForm.id = 'saveForm';

  //Initials: 
  const initialLabel = document.createElement('label');
  initialLabel.setAttribute('for', 'initials');
  initialLabel.appendChild(document.createTextNode('Initials: '));
  saveForm.appendChild(initialLabel);

  //input
  const initials = document.createElement('input');
  initials.type = 'text';
  initials.name = 'initials';
  initials.id = 'initials';
  saveForm.appendChild(initials);

  //button to submit form
  const saveBtn = document.createElement('button');
  const saveBtnTxt = document.createTextNode('Save Results');
  saveBtn.appendChild(saveBtnTxt);
  saveBtn.id = 'saveBtn';
  saveBtn.addEventListener('click', handleSave.bind(null, compTotal, playerTotal));
  saveForm.appendChild(saveBtn);

  gameDiv.appendChild(saveForm);

}

//Based on the cards dealt, add elements to the user interface to represent both the user's and computer's hands (set of cards).
function display(computer, player) {
  const gameSelect = document.querySelector('.game');
  //computer objects
  //create board, and add label, hand, cards, 
  const compBoard = document.createElement('div'); //green bg
  compBoard.id = 'compBoard';
  const compHand = document.createElement('div'); //purple bg
  compHand.id = 'compHand';
  const compLabel = document.createElement('div'); //yellow bg
  compLabel.id = 'compLabel';
  const compTxt = document.createTextNode('Computer Hand | Total: ?');
  //create a card with its back faced-up
  const cardback = document.createElement('div');
  cardback.id = 'cardBack';
  //give cardback a random rotation: -5<deg<5
  const deg = Math.random() * 10 - 5;
  cardback.style.transform = `rotate(${deg}deg)`;
  compHand.appendChild(cardback);

  compLabel.appendChild(compTxt);
  compBoard.appendChild(compLabel);
  compBoard.appendChild(compHand);
  gameSelect.appendChild(compBoard);

  addCard(computer[0], 0);

  //player objects
  const playerBoard = document.createElement('div');
  playerBoard.id = 'playerBoard';
  const playerHand = document.createElement('div');
  playerHand.id = 'playerHand';
  const playerLabel = document.createElement('div');
  playerLabel.id = 'playerLabel';
  const playerTxt = document.createTextNode(`Player Hand | Total: ${calcTotal(player)}`);

  playerLabel.appendChild(playerTxt);
  playerBoard.appendChild(playerLabel);
  playerBoard.appendChild(playerHand);
  gameSelect.appendChild(playerBoard);

  addCard(player[0], 1);
  addCard(player[1], 1);
}

//Deal the cards - alternate between the computer and player
function play(deck) {
  //init computer and player hand
  const computer = [];
  const player = [];

  //deal cards
  computer.push(deck.cards[0]);
  computer.push(deck.cards[2]);
  player.push(deck.cards[1]);
  player.push(deck.cards[3]);

  for (let i = 3; i >= 0; i--) {
    deck.cards.shift();
  }

  //display cards and UI
  display(computer, player);

  //create hit button
  const buttonDiv = document.createElement('div');
  buttonDiv.id = 'buttons';
  const hitBtn = document.createElement('button');
  hitBtn.id = 'hit';
  hitBtn.appendChild(document.createTextNode('Hit'));
  //create stand button
  const standBtn = document.createElement('button');
  standBtn.id = 'stand';
  standBtn.appendChild(document.createTextNode('Stand'));
  buttonDiv.appendChild(hitBtn);
  buttonDiv.appendChild(standBtn);
  document.querySelector('.game').appendChild(buttonDiv);

  //the user can choose to be dealt more cards ("hit") or stop being dealt cards ("stand")
  hitBtn.addEventListener('click', () => {
    //if the user's hand ends up exceeding 21, then the user automatically loses
    //move card from deck to player hand and update
    const next = deck.cards[0];
    deck.cards.shift();
    player.push(next);
    addCard(next, 1); //display new card to hand
    updateTotal(player, 1); //update player total based on current hand

    const playerScore = calcTotal(player); //check if total>21

    if (playerScore > 21) {
      endGame(player, computer, deck);
    }
  });

  standBtn.addEventListener('click', () => {
    //if the user chooses to "stand" (to stop being dealt cards), then the computer can choose to continually "hit" or "stand"
    endGame(player, computer, deck);
  });
}

//when the button is clicked
function handleClick(evt) {
  if (evt) {
    evt.preventDefault(); //prevent form action
  }
  //hide form element
  const form = document.querySelector('form');
  form.style.display = 'none';
  //get input
  const startValues = document.querySelector('#startValues').value;

  //generate a deck of 52 shuffled cards
  const deck = new Deck();

  if (startValues) { //if a sequence is provided
    const startSeq = startValues.split(',');
    deck.addStart(startSeq);
  }

  //start the game
  play(deck);
}

//main
function main() {
  //add favicon element so page doesnt make favicon get requests
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.href = '../images/ace-of-spades.png';
  document.head.appendChild(favicon);

  const start = document.querySelector('form');
  start.id = 'start';

  const b = document.querySelector('.playBtn');
  b.addEventListener('click', handleClick);
}

document.addEventListener('DOMContentLoaded', main);