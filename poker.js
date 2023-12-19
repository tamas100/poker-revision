const $newGameButton = document.querySelector('.js-new-game-button');
const $playerCardsContainer = document.querySelector('.js-player-cards-container');
const $chipCountContainer = document.querySelector('.js-chip-count-container')
const $potContainer = document.querySelector('.js-pot-container');
const $betArea = document.querySelector('.js-bet-area');
const $betSlider = document.querySelector('#bet-amount');
const $betSliderValue = document.querySelector('.js-slider-value');
const $betButton = document.querySelector('.js-bet-button');

// program state - program állapota
let {
    deckId,
    playerCards,
    playerChips,
    computerChips,
    pot             // kassza
} = getInitialState();

function getInitialState() {
    return {   // mindig egy sorban a return-nel
        deckId: null, // nem definiált érték
        playerCards: [],
        playerChips: 100,
        computerChips: 100,
        pot: 0
    }
}

function initialize() {
    ({ deckId, playerCards, playerChips, computerChips, pot } = getInitialState());
}

function handleBet() {
    playerChips -= $betSlider.value;
    pot += parseInt($betSlider.value);
    $betSlider.setAttribute('max', playerChips);
    render();
}

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

function canBet() {
    return playerCards.length === 2 && playerChips > 0 && pot === 3;
}

function renderSlider() {
    if (canBet()) {
        $betArea.classList.remove('invisible');
        $betSlider.setAttribute('max', playerChips);
        $betSliderValue.innerText = $betSlider.value
    } else {
        $betArea.classList.add('invisible');
    }
}

function render() {
    renderPlayerCards();
    renderChips();
    renderPot();
    renderSlider();
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

function postBlinds() {
    playerChips -= 1;
    computerChips -= 2;
    pot += 3;
    render();
}

// Egy leosztás indítása
function startHand() {
    postBlinds(); // vaktétek adminisztrálása
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then(data => data.json())
        .then(response => {
            deckId = response.deck_id;
            drawAndRenderPlayerCards(); // TODO: refactorálás async-await segítségével
        });
}

// Egy játék több leosztásból áll.
function startGame() {
    initialize();
    startHand();
}


$newGameButton.addEventListener("click", startGame);
$betSlider.addEventListener('input', render);
$betButton.addEventListener("click", handleBet)
render();
