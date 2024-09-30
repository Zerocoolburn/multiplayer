const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "Public" folder
app.use(express.static('Public'));

let players = {};
let dealerHand = [];
let playerHands = {};
let leaderboard = {};
let currentBet = {};

function dealCard() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return { value: values[Math.floor(Math.random() * values.length)], suit: suits[Math.floor(Math.random() * suits.length)] };
}

function calculateHandValue(hand) {
  let value = 0;
  let aces = 0;
  
  hand.forEach(card => {
    if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'A') {
      value += 11;
      aces++;
    } else {
      value += parseInt(card.value);
    }
  });

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinGame', (playerName) => {
    players[socket.id] = { name: playerName, balance: 10000, hand: [] };
    leaderboard[playerName] = 10000;
    io.emit('updateLeaderboard', leaderboard);
  });

  socket.on('placeBet', (betAmount) => {
    players[socket.id].balance -= betAmount;
    currentBet[socket.id] = betAmount;
    io.emit('updateLeaderboard', leaderboard);
    
    // Deal initial cards
    playerHands[socket.id] = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];
    
    io.to(socket.id).emit('initialDeal', { playerHand: playerHands[socket.id], dealerHand: dealerHand[0] });
  });

  socket.on('hit', () => {
    const newCard = dealCard();
    playerHands[socket.id].push(newCard);
    const playerHandValue = calculateHandValue(playerHands[socket.id]);

    io.to(socket.id).emit('updatePlayerHand', { playerHand: playerHands[socket.id], playerHandValue });

    if (playerHandValue > 21) {
      io.to(socket.id).emit('bust');
    }
  });

  socket.on('stand', () => {
    let dealerValue = calculateHandValue(dealerHand);
    while (dealerValue < 17) {
      dealerHand.push(dealCard());
      dealerValue = calculateHandValue(dealerHand);
    }
    
    const playerValue = calculateHandValue(playerHands[socket.id]);
    const betAmount = currentBet[socket.id];

    if (dealerValue > 21 || playerValue > dealerValue) {
      players[socket.id].balance += betAmount * 2;
      io.to(socket.id).emit('playerWin', { dealerHand, dealerValue });
    } else if (playerValue === dealerValue) {
      players[socket.id].balance += betAmount;
      io.to(socket.id).emit('push', { dealerHand, dealerValue });
    } else {
      io.to(socket.id).emit('dealerWin', { dealerHand, dealerValue });
    }

    leaderboard[players[socket.id].name] = players[socket.id].balance;
    io.emit('updateLeaderboard', leaderboard);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete players[socket.id];
  });
});

// Use Railway's dynamic PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
