const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('Public'));

let players = {};
let gameInProgress = false;
let dealerHand = [];
let currentPlayer = null;

const deck = generateDeck();

function generateDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ rank, suit });
        });
    });
    return deck;
}

function dealCard(hand) {
    const card = deck.pop();
    hand.push(card);
}

function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    hand.forEach(card => {
        if (['J', 'Q', 'K'].includes(card.rank)) {
            value += 10;
        } else if (card.rank === 'A') {
            value += 11;
            aces += 1;
        } else {
            value += parseInt(card.rank);
        }
    });
    while (value > 21 && aces) {
        value -= 10;
        aces -= 1;
    }
    return value;
}

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    socket.on('joinGame', (playerName) => {
        if (!players[socket.id]) {
            players[socket.id] = { name: playerName, balance: 10000, hand: [] };
            updateLeaderboard();
        }
    });

    socket.on('placeBet', ({ playerName, betAmount }) => {
        if (!gameInProgress) {
            players[socket.id].bet = betAmount;
            currentPlayer = socket.id;
            startNewRound();
        }
    });

    socket.on('hit', (playerName) => {
        if (currentPlayer === socket.id && gameInProgress) {
            dealCard(players[socket.id].hand);
            const playerValue = calculateHandValue(players[socket.id].hand);
            if (playerValue > 21) {
                gameInProgress = false;
                io.emit('gameState', { playerHand: players[socket.id].hand, dealerHand, status: 'Busted!' });
                endRound();
            } else {
                io.emit('gameState', { playerHand: players[socket.id].hand, dealerHand, status: `Your value: ${playerValue}` });
            }
        }
    });

    socket.on('stand', (playerName) => {
        if (currentPlayer === socket.id && gameInProgress) {
            const playerValue = calculateHandValue(players[socket.id].hand);
            let dealerValue = calculateHandValue(dealerHand);

            while (dealerValue < 17) {
                dealCard(dealerHand);
                dealerValue = calculateHandValue(dealerHand);
            }

            if (dealerValue > 21 || playerValue > dealerValue) {
                players[socket.id].balance += players[socket.id].bet * 2;
                io.emit('gameState', { playerHand: players[socket.id].hand, dealerHand, status: 'You win!' });
            } else if (dealerValue === playerValue) {
                players[socket.id].balance += players[socket.id].bet;
                io.emit('gameState', { playerHand: players[socket.id].hand, dealerHand, status: 'It\'s a draw!' });
            } else {
                io.emit('gameState', { playerHand: players[socket.id].hand, dealerHand, status: 'Dealer wins!' });
            }

            gameInProgress = false;
            endRound();
        }
    });

    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        delete players[socket.id];
        updateLeaderboard();
    });

    function startNewRound() {
        gameInProgress = true;
        dealerHand = [];
        dealCard(dealerHand);
        dealCard(dealerHand);
        players[currentPlayer].hand = [];
        dealCard(players[currentPlayer].hand);
        dealCard(players[currentPlayer].hand);
        io.emit('gameState', { playerHand: players[currentPlayer].hand, dealerHand: [dealerHand[0]], status: 'Game Started' });
    }

    function endRound() {
        updateLeaderboard();
        setTimeout(() => {
            io.emit('gameState', { playerHand: [], dealerHand: [], status: 'New round starting soon...' });
            startNewRound();
        }, 5000);
    }

    function updateLeaderboard() {
        const leaderboard = Object.values(players).map(player => ({ name: player.name, balance: player.balance }));
        io.emit('updateLeaderboard', leaderboard);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
