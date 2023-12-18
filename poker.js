const $newGameButton = document.querySelector('.js-new-game-button');
const $playerCardsContainer = document.querySelector('.js-player-cards-container');
const $chipCountContainer = document.querySelector('.js-chip-count-container')
const $potContainer = document.querySelector('.js-pot-container');

// program state - program állapota
let deckId = null; // nem definiált érték
let playerCards = [];
let playerChips = 100;
let computerChips = 100;
let pot = 0; // kassza

function renderPlayerCards() {
    let html = '';
    for (let card of playerCards) {
        html += `<img src="${card.image}" alt="${card.code}"/>`;
    }
    $playerCardsContainer.innerHTML = html;
}

function renderChips() {
    $chipCountContainer.innerHTML = `
        <div class="chip-count">Player: ${playerChips}</div>
        <div class="chip-count">Computer: ${computerChips}</div>
    `;
}

function renderPot() {
    $potContainer.innerHTML = `
        <div class="chip-count">Pot: ${pot}</div>
    `;
}

function render() {
    renderPlayerCards();
    renderChips();
    renderPot();
}

function drawAndRenderPlayerCards() {
    if (deckId === null) return; // ha nincs deckId kilép
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(data => data.json())
        .then(response => {
            playerCards = response.cards;
            render();
        });
}

function startGame() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then(data => data.json())
        .then(response => {
            deckId = response.deck_id;
            drawAndRenderPlayerCards(); // TODO: refactorálás async-await segítségével
        });
}


$newGameButton.addEventListener("click", startGame);
render();