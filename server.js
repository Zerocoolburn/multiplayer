const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let board = Array(9).fill('');
let currentTurn = 'X';
let players = {};
let gameActive = true;

app.use(express.static('Public'));

const checkWinner = () => {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return pattern; // Return winning pattern
        }
    }

    return board.includes('') ? null : 'draw';
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('playerJoin', (name) => {
        players[socket.id] = name;
        console.log(`${name} joined the game.`);
    });

    socket.on('playerMove', ({ cellId, player }) => {
        const index = parseInt(cellId.split('-')[1]);
        if (board[index] === '' && gameActive) {
            board[index] = player;
            const winner = checkWinner();

            if (winner) {
                if (winner === 'draw') {
                    io.emit('gameUpdate', { board, turn: '', winner: null });
                } else {
                    io.emit('gameUpdate', { board, turn: '', winner: currentTurn, pattern: winner });
                    gameActive = false;
                }
            } else {
                currentTurn = currentTurn === 'X' ? 'O' : 'X';
                io.emit('gameUpdate', { board, turn: currentTurn, winner: null });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id];
    });
});

// Reset the game
io.on('resetGame', () => {
    board = Array(9).fill('');
    currentTurn = 'X';
    gameActive = true;
    io.emit('resetGame');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
