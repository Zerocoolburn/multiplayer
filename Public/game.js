const ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => {
    const name = prompt("Enter your name:");
    ws.send(JSON.stringify({ type: 'join', name }));
};

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'leaderboard') {
        updateLeaderboard(data.leaderboard);
    }
    if (data.type === 'gameState') {
        updateGameState(data);
    }
};

function updateLeaderboard(leaderboard) {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    for (const player in leaderboard) {
        const li = document.createElement('li');
        li.textContent = `${player}: $${leaderboard[player]}`;
        leaderboardList.appendChild(li);
    }
}

function updateGameState(data) {
    document.getElementById('dealer-hand').innerHTML = '';
    document.getElementById('player-hand').innerHTML = '';
    document.getElementById('balance').textContent = `$${data.balance}`;

    data.dealerHand.forEach(card => {
        const cardDiv = createCard(card);
        document.getElementById('dealer-hand').appendChild(cardDiv);
    });

    data.playerHand.forEach(card => {
        const cardDiv = createCard(card);
        document.getElementById('player-hand').appendChild(cardDiv);
    });
}

function createCard(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.dataset.value = card.value;
    cardDiv.dataset.suit = card.suit;

    // Set background color based on card suit
    const suitColors = {
        'hearts': 'red',
        'diamonds': 'red',
        'clubs': 'black',
        'spades': 'black'
    };
    
    cardDiv.style.backgroundColor = suitColors[card.suit];
    cardDiv.innerHTML = `${card.value} of ${card.suit}`;
    
    return cardDiv;
}

document.getElementById('placeBet').onclick = () => {
    const betAmount = document.getElementById('bet').value;
    ws.send(JSON.stringify({ type: 'placeBet', amount: betAmount }));
};

document.getElementById('hit').onclick = () => {
    ws.send(JSON.stringify({ type: 'hit' }));
};

document.getElementById('stand').onclick = () => {
    ws.send(JSON.stringify({ type: 'stand' }));
};
