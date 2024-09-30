const socket = io();

const cells = document.querySelectorAll('.cell');
const gameBoard = document.getElementById('game-board');
const statusDiv = document.getElementById('status');
const nameInput = document.getElementById('name-input');
const startGameButton = document.getElementById('start-game');
let playerName;
let currentTurn = 'X'; // X starts the game
let gameActive = true;

startGameButton.addEventListener('click', () => {
    playerName = nameInput.value;
    if (playerName.trim() === '') {
        alert('Please enter your name');
        return;
    }
    socket.emit('playerJoin', playerName);
    document.getElementById('player-info').classList.add('hidden');
    gameBoard.classList.remove('hidden');
});

cells.forEach((cell) => {
    cell.addEventListener('click', () => {
        if (!gameActive || cell.textContent !== '') return;
        socket.emit('playerMove', { cellId: cell.id, player: currentTurn });
    });
});

socket.on('gameUpdate', ({ board, turn, winner }) => {
    board.forEach((mark, index) => {
        cells[index].textContent = mark;
    });
    currentTurn = turn;
    statusDiv.textContent = winner ? `${winner} wins!` : `${currentTurn}'s turn`;

    if (winner) {
        gameActive = false;
        winner.forEach((winIndex) => {
            document.getElementById(`cell-${winIndex}`).classList.add('winning-cell');
        });
    }
});

socket.on('resetGame', () => {
    cells.forEach((cell) => {
        cell.textContent = '';
        cell.classList.remove('winning-cell');
    });
    gameActive = true;
    currentTurn = 'X';
    statusDiv.textContent = "X's turn";
});
