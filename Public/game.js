const socket = io();

let playerName = prompt("Enter your name:");

document.getElementById('player-name').textContent = playerName;

socket.emit('joinGame', playerName);

document.getElementById('placeBet').onclick = () => {
  const betAmount = document.getElementById('bet').value;
  socket.emit('placeBet', betAmount);
};

document.getElementById('hit').onclick = () => {
  socket.emit('hit');
};

document.getElementById('stand').onclick = () => {
  socket.emit('stand');
};

socket.on('updateLeaderboard', (leaderboard) => {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';
  for (const player in leaderboard) {
    const li = document.createElement('li');
    li.textContent = `${player}: $${leaderboard[player]}`;
    leaderboardList.appendChild(li);
  }
});

socket.on('initialDeal', (data) => {
  document.getElementById('dealer-hand').innerHTML = `<div class="card">${data.dealerHand.value} of ${data.dealerHand.suit}</div>`;
  document.getElementById('player-hand').innerHTML = '';
  data.playerHand.forEach(card => {
    document.getElementById('player-hand').innerHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
  });
});

socket.on('updatePlayerHand', (data) => {
  document.getElementById('player-hand').innerHTML = '';
  data.playerHand.forEach(card => {
    document.getElementById('player-hand').innerHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
  });
});

socket.on('bust', () => {
  alert("You busted!");
});

socket.on('playerWin', (data) => {
  updateDealerHand(data.dealerHand);
  alert("You win!");
});

socket.on('dealerWin', (data) => {
  updateDealerHand(data.dealerHand);
  alert("Dealer wins!");
});

socket.on('push', (data) => {
  updateDealerHand(data.dealerHand);
  alert("It's a push!");
});

function updateDealerHand(dealerHand) {
  document.getElementById('dealer-hand').innerHTML = '';
  dealerHand.forEach(card => {
    document.getElementById('dealer-hand').innerHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
  });
}
