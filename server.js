const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "Public" folder
app.use(express.static('Public'));

let gameState = {
  dealerHand: [],
  playerHands: {},
  balances: {},
};

const deck = [
  '2 of clubs', '3 of clubs', '4 of clubs', '5 of clubs', '6 of clubs', '7 of clubs', '8 of clubs', '9 of clubs', '10 of clubs', 'J of clubs', 'Q of clubs', 'K of clubs', 'A of clubs',
  '2 of diamonds', '3 of diamonds', '4 of diamonds', '5 of diamonds', '6 of diamonds', '7 of diamonds', '8 of diamonds', '9 of diamonds', '10 of diamonds', 'J of diamonds', 'Q of diamonds', 'K of diamonds', 'A of diamonds',
  '2 of hearts', '3 of hearts', '4 of hearts', '5 of hearts', '6 of hearts', '7 of hearts', '8 of hearts', '9 of hearts', '10 of hearts', 'J of hearts', 'Q of hearts', 'K of hearts', 'A of hearts',
  '2 of spades', '3 of spades', '4 of spades', '5 of spades', '6 of spades', '7 of spades', '8 of spades', '9 of spades', '10 of spades', 'J of spades', 'Q of spades', 'K of spades', 'A of spades',
];

// Utility to get random card
function getRandomCard() {
  const randomIndex = Math.floor(Math.random() * deck.length);
  return deck[randomIndex];
}

function calculateScore(hand) {
  // Basic score calculation logic for blackjack
  let score = 0;
  let aces = 0;
  hand.forEach(card => {
    const value = card.split(' ')[0];
    if (value === 'A') {
      aces += 1;
      score += 11;
    } else if (['K', 'Q', 'J'].includes(value)) {
      score += 10;
    } else {
      score += parseInt(value);
    }
  });
  
  // Handle aces
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinGame', (name) => {
    gameState.playerHands[socket.id] = [getRandomCard(), getRandomCard()];
    gameState.balances[socket.id] = 10000;
    io.emit('gameUpdate', gameState);
  });

  socket.on('placeBet', (bet) => {
    const playerHand = gameState.playerHands[socket.id];
    const dealerHand = [getRandomCard(), getRandomCard()];
    gameState.dealerHand = dealerHand;

    // Resolve bet
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (playerScore > dealerScore || dealerScore > 21) {
      gameState.balances[socket.id] += bet;
    } else {
      gameState.balances[socket.id] -= bet;
    }

    io.emit('gameUpdate', gameState);
  });

  socket.on('playerAction', (action) => {
    if (action === 'hit') {
      gameState.playerHands[socket.id].push(getRandomCard());
    } else if (action === 'stand') {
      // Handle stand logic
    }
    io.emit('gameUpdate', gameState);
  });

  socket.on('disconnect', () => {
    delete gameState.playerHands[socket.id];
    delete gameState.balances[socket.id];
    console.log('A user disconnected:', socket.id);
    io.emit('gameUpdate', gameState);
  });
});

// Use Railway's dynamic PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
