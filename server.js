const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// In-memory leaderboard (you can replace this with a database later)
const leaderboard = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  let player = { id: socket.id, wins: 0, losses: 0 };

  // When a player joins the game, add them to the leaderboard
  socket.on('joinGame', (playerName) => {
    player.name = playerName;
    leaderboard[socket.id] = player;
    io.emit('leaderboardUpdate', leaderboard);
  });

  // Handle the Tic-Tac-Toe game logic
  socket.on('makeMove', (gameState) => {
    // Broadcast the move to the other player
    socket.broadcast.emit('updateGame', gameState);
  });

  // Handle game end and update leaderboard
  socket.on('gameEnd', (result) => {
    if (result === 'win') {
      leaderboard[socket.id].wins += 1;
    } else if (result === 'lose') {
      leaderboard[socket.id].losses += 1;
    }
    io.emit('leaderboardUpdate', leaderboard);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete leaderboard[socket.id];
    io.emit('leaderboardUpdate', leaderboard);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
