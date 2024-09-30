const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let players = {};

app.use(express.static('Public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (data) => {
        players[socket.id] = { name: data.name, balance: data.balance };
        io.emit('leaderboard', players);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('leaderboard', players);
        console.log('A user disconnected');
    });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log('Server is running on port ' + port);
});
