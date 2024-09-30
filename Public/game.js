const socket = io();
const cells = document.querySelectorAll('[data-cell]');
const restartButton = document.getElementById('restartButton');
const leaderboardList = document.getElementById('leaderboardList');

let playerSymbol = 'X'; // By default
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];

// Ask player for their name when joining
const playerName = prompt("Enter your name:");
socket.emit('joinGame', playerName);

// Update the game state when a player makes a move
function handleCellClick(e) {
  const index = Array.from(cells).indexOf(e.target);
  if (gameState[index] === '' && gameActive) {
    gameState[index] = playerSymbol;
    e.target.textContent = playerSymbol;
    checkWinner();
    socket.emit('makeMove', gameState);
  }
}

// Listen for opponent's move
socket.on('updateGame', (newGameState) => {
  gameState = newGameState;
  cells.forEach((cell, index) => {
    cell.textContent = gameState[index];
  });
  checkWinner();
});

// Check for winner or tie
function checkWinner() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  let winner = null;

  winningCombinations.forEach(combination => {
    const [a, b, c] = combination;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      winner = gameState[a];
    }
  });

  if (winner) {
    alert(`${winner} wins!`);
    gameActive = false;
    if (winner === playerSymbol) {
      socket.emit('gameEnd', 'win');
    } else {
      socket.emit('gameEnd', 'lose');
    }
  } else if (!gameState.includes('')) {
    alert('It\'s a tie!');
    gameActive = false;
  }
}

// Restart the game
restartButton.addEventListener('click', () => {
  gameState = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  cells.forEach(cell => (cell.textContent = ''));
});

// Handle cell clicks
cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick);
});

// Update leaderboard when it's changed
socket.on('leaderboardUpdate', (leaderboard) => {
  leaderboardList.innerHTML = '';
  Object.values(leaderboard).forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name}: ${player.wins} Wins, ${player.losses} Losses`;
    leaderboardList.appendChild(li);
  });
});
