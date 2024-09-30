const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardWidth = 73;
const cardHeight = 98;
const spriteSheetWidth = 870;
const spriteSheetHeight = 1200;

// Player-related variables
const socket = io(); // Connect to server
let balance = 10000;
let playerName = prompt('Enter your name:');
document.getElementById('player-name').innerText = playerName;
document.getElementById('balance').innerText = balance;

socket.emit('join', { name: playerName, balance: balance });

// Function to calculate background position for the sprite sheet
function getCardBackground(card) {
    const valueIndex = values.indexOf(card.value);
    const suitIndex = suits.indexOf(card.suit);
    const xPos = valueIndex * cardWidth;
    const yPos = suitIndex * cardHeight;
    
    return `-${xPos}px -${yPos}px`;
}

// Function to render card in hand
function renderCard(card, containerId) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.style.backgroundPosition = getCardBackground(card);
    document.getElementById(containerId).appendChild(cardDiv);
}

// Example to render a few cards
const playerCards = [
    { value: '7', suit: 'hearts' },
    { value: '6', suit: 'diamonds' },
    { value: '5', suit: 'clubs' }
];

const dealerCards = [
    { value: '9', suit: 'spades' },
    { value: '8', suit: 'hearts' }
];

function renderGame() {
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';

    playerCards.forEach(card => renderCard(card, 'player-cards'));
    dealerCards.forEach(card => renderCard(card, 'dealer-cards'));
}

renderGame();
