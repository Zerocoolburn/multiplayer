const socket = io();
let playerName = '';
let playerBalance = 10000;
let playerHand = [];
let dealerHand = [];
let currentBet = 0;

const playerCardsDiv = document.getElementById('player-cards');
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerBalanceSpan = document.getElementById('player-balance');
const playerNameSpan = document.getElementById('player-name');
const gameStatusDiv = document.getElementById('game-status');
const leaderboardList = document.getElementById('leaderboard-list');

document.getElementById('join-game').addEventListener('click', () => {
    playerName = document.getElementById('name-input').value.trim();
    if (!playerName) {
        alert('Please enter a name');
        return;
    }
    document.getElementById('player-info').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    playerNameSpan.textContent = playerName;
    socket.emit('joinGame', playerName);
});

document.getElementById('place-bet').addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    if (betAmount > playerBalance || betAmount <= 0) {
        alert('Invalid bet');
        return;
    }
    currentBet = betAmount;
    socket.emit('placeBet', { playerName, betAmount });
});

document.getElementById('hit').addEventListener('click', () => {
    socket.emit('hit', playerName);
});

document.getElementById('stand').addEventListener('click', () => {
    socket.emit('stand', playerName);
});

socket.on('gameState', (state) => {
    playerHand = state.playerHand;
    dealerHand = state.dealerHand;
    renderCards(playerCardsDiv, playerHand);
    renderCards(dealerCardsDiv, dealerHand);
    gameStatusDiv.textContent = state.status;
});

socket.on('updateBalance', (balance) => {
    playerBalance = balance;
    playerBalanceSpan.textContent = playerBalance;
});

socket.on('updateLeaderboard', (leaderboard) => {
    leaderboardList.innerHTML = '';
    leaderboard.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}: $${player.balance}`;
        leaderboardList.appendChild(li);
    });
});

function renderCards(element, hand) {
    element.innerHTML = '';
    hand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.textContent = card.rank + card.suit;
        element.appendChild(cardDiv);
    });
}
