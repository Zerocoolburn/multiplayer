const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "Public" folder
app.use(express.static('Public'));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('playerAction', (gameState) => {
    socket.broadcast.emit('updateGame', gameState);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Use the dynamically provided PORT from Railway or fallback to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
