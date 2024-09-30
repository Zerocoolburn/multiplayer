const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let dealerHand = [];
let playerHands = {};
let leaderboard = {};
let currentBet = {};

// Start a new game
function startGame() {
  dealerHand = [];
  playerHands = {};
  leaderboard = {};
}

// Logic for Blackjack game
function dealCards() {
  // Implementation of dealing cards logic
}

// Broadcast to all clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Handle player actions
    if (data.type === 'join') {
      players[data.name] = ws;
      leaderboard[data.name] = 10000; // Starting balance
      broadcast({ type: 'leaderboard', leaderboard });
    }
    if (data.type === 'placeBet') {
      // Handle bet placement
      currentBet[data.name] = data.amount;
      // Logic to deal cards or update state
      broadcast({ type: 'gameState', dealerHand, playerHands, leaderboard });
    }
    if (data.type === 'hit') {
      // Handle hit action
      // Logic to deal another card
      broadcast({ type: 'gameState', dealerHand, playerHands, leaderboard });
    }
    if (data.type === 'stand') {
      // Handle stand action
      // Logic for dealer to play and determine winner
      broadcast({ type: 'gameState', dealerHand, playerHands, leaderboard });
    }
  });

  ws.on('close', () => {
    // Handle player disconnect
    // Cleanup logic
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startGame();
});
