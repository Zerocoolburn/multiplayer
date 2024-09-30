const socket = io();

document.getElementById('placeBet').addEventListener('click', () => {
  const bet = parseInt(document.getElementById('betAmount').value);
  if (bet > 0) {
    socket.emit('placeBet', bet);
  }
});

document.getElementById('hit').addEventListener('click', () => {
  socket.emit('playerAction', 'hit');
});

document.getElementById('stand').addEventListener('click', () => {
  socket.emit('playerAction', 'stand');
});

socket.on('gameUpdate', (gameState) => {
  // Update player cards
  const playerCardsDiv = document.getElementById('playerCards');
  playerCardsDiv.innerHTML = '';
  const playerHand = gameState.playerHands[socket.id] || [];
  playerHand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.textContent = card;
    cardDiv.className = 'card glowing';
    playerCardsDiv.appendChild(cardDiv);
  });

  // Update dealer cards
  const dealerCardsDiv = document.getElementById('dealerCards');
  dealerCardsDiv.innerHTML = '';
  gameState.dealerHand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.textContent = card;
    cardDiv.className = 'card glowing';
    dealerCardsDiv.appendChild(cardDiv);
  });

  // Update balance
  document.getElementById('balanceAmount').textContent = gameState.balances[socket.id];

  // Update leaderboard
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '';
  for (const playerId in gameState.balances) {
    const playerBalance = gameState.balances[playerId];
    const playerName = gameState.playerHands[playerId] ? `Player ${playerId}` : 'Unknown';
    leaderboard.innerHTML += `<p>${playerName}: $${playerBalance}</p>`;
  }
});
