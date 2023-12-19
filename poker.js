const $newGameButton = document.querySelector('.js-new-game-button');
const $playerCardsContainer = document.querySelector('.js-player-cards-container');
const $chipCountContainer = document.querySelector('.js-chip-count-container')
const $potContainer = document.querySelector('.js-pot-container');
const $betArea = document.querySelector('.js-bet-area');
const $betSlider = document.querySelector('#bet-amount');
const $betSliderValue = document.querySelector('.js-slider-value');
const $betButton = document.querySelector('.js-bet-button');
const $computerCardsContainer = document.querySelector('.js-computer-cards-container');


// program state - program állapota
let {
    deckId,
    playerCards,
    computerCards, //TODO private? OOP???
    playerChips,
    computerChips,
    playerBetPlaced,
    pot             // kassza
} = getInitialState();

function getInitialState() {
    return {   // mindig egy sorban a return-nel
        deckId: null, // nem definiált érték
        playerCards: [],
        computerCards: [],
        playerChips: 100,
        computerChips: 100,
        playerBetPlaced: false,
        pot: 0
    }
}

function initialize() {
    ({
        deckId,
        playerCards,
        computerCards,
        playerChips, computerChips,
        playerBetPlaced,
        pot
    } = getInitialState());
}

function shouldComputerCall() {
    if (computerCards.length !== 2) return false; // extra védelem
    const card1Code = computerCards[0].code; // pl. AC, 4H, 0H (10: 0)
    const card2Code = computerCards[1].code;
    const card1Value = card1Code[0];
    const card2Value = card2Code[0];
    const card1Suit = card1Code[1];
    const card2Suit = card2Code[1];

    return card1Value === card2Value ||
        ['0', 'J', 'Q', 'K', 'A'].includes(card1Value) ||
        ['0', 'J', 'Q', 'K', 'A'].includes(card2Value) ||
        (
            card1Suit === card2Suit &&
            Math.abs(Number(card1Value) - Number(card2Value)) <= 2
        );
    return true;
}

function computerMoveAfterBet() {
    if (deckId === null) return; // ha nincs deckId kilép
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(data => data.json())
        .then(response => {
            computerCards = response.cards;
            alert(shouldComputerCall() ? 'Call' : 'Fold');
            console.log(computerCards);
            //render();
        });
}

function handleBet() {
    // játékos zsetonjaiból kivonjuk a bet értékét
    playerChips -= $betSlider.value;
    // a pothoz hozzáadjuk a bet értékét 
    pot += parseInt($betSlider.value);
    // a maximális bet érték a játékos zsetonjaival egyenlő
    $betSlider.setAttribute('max', playerChips);
    // játék állapota: játékos megtette a tétjét
    playerBetPlaced = true;
    render();
    computerMoveAfterBet();
}

function renderComputerCards() {
    let html = '';
    for (let card of computerCards) {
        html += `<img src="${card.image}" alt="${card.code}"/>`;
    }
    $computerCardsContainer.innerHTML = html;
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
    return playerCards.length === 2 && playerChips > 0 && playerBetPlaced === false;
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
    renderComputerCards();
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
