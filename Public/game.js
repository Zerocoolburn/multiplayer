const socket = io();

socket.on('playerAction', (data) => {
  console.log('Player action received:', data);
});

document.addEventListener('keydown', (event) => {
  const action = { key: event.key };
  socket.emit('playerAction', action);
});
