//----------------------------------------------------------------
// HTML elemek szelektálása
const $newGameButton = document.querySelector('.js-new-game-button');
const $playerCardsContainer = document.querySelector('.js-player-cards-container');
const $computerCardsContainer = document.querySelector('.js-computer-cards-container');
const $playerChipCountContainer = document.querySelector('.js-player-chip-count-container')
const $computerChipCountContainer = document.querySelector('.js-computer-chip-count-container')
const $computerActionContainer = document.querySelector('.js-computer-action-container');
const $potContainer = document.querySelector('.js-pot-container');
const $betArea = document.querySelector('.js-bet-area');
const $betSlider = document.querySelector('#bet-amount');
const $betSliderValue = document.querySelector('.js-slider-value');
const $betButton = document.querySelector('.js-bet-button');

//----------------------------------------------------------------
// Állapotok
let {
    deckId,
    playerCards,
    computerCards,
    computerAction, //TODO private? OOP???
    playerChips,
    playerBets,
    computerChips,
    computerBets,
    playerBetPlaced,
    pot             // kassza
} = getInitialState();

//----------------------------------------------------------------
// Állapot változtató függvények
function getInitialState() {
    return {   // mindig egy sorban a return-nel
        deckId: null, // nem definiált érték
        playerCards: [],
        computerCards: [],
        computerAction: null,
        playerChips: 100,
        playerBets: 0,
        computerChips: 100,
        computerBets: 0,
        playerBetPlaced: false,
        pot: 0
    }
}

function initialize() {
    ({
        deckId,
        playerCards,
        computerCards,
        computerAction, // játékos cselekedete (call, fold)
        playerChips,
        playerBets,
        computerChips,
        computerBets,
        playerBetPlaced,
        pot
    } = getInitialState());
}

function canBet() {
    return playerCards.length === 2 && playerChips > 0 && playerBetPlaced === false;
}

//----------------------------------------------------------------
// Render függvények
function renderSlider() {
    if (canBet()) {
        $betArea.classList.remove('invisible');
        $betSlider.setAttribute('max', playerChips);
        $betSliderValue.innerText = $betSlider.value
    } else {
        $betArea.classList.add('invisible');
    }
}

function renderCardsInContainer(cards, container) {
    let html = '';
    for (let card of cards) {
        html += `<img src="${card.image}" alt="${card.code}"/>`;
    }
    container.innerHTML = html;
}

function renderAllCards() {
    renderCardsInContainer(playerCards, $playerCardsContainer);
    renderCardsInContainer(computerCards, $computerCardsContainer);
}

function renderChips() {
    $playerChipCountContainer.innerHTML = `
        <div class="chip-count">Játékos: ${playerChips} zseton</div>
    `;
    $computerChipCountContainer.innerHTML = `
        <div class="chip-count">Számítógép: ${computerChips} zseton</div>
    `;
}

function renderPot() {
    $potContainer.innerHTML = `
        <div class="chip-count">Pot: ${pot}</div>
    `;
}

function renderActions() {
    $computerActionContainer.innerHTML = computerAction ?? "";
}                                          // nullish operátor

function render() {
    renderAllCards();
    renderChips();
    renderPot();
    renderSlider();
    renderActions();
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
    playerBets += 1;
    computerChips -= 2;
    computerBets += 2;
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
            drawAndRenderPlayerCards();
            // TODO: refactorálás async-await segítségével            
        });
}

// Egy játék több leosztásból áll.
function startGame() {
    initialize();
    startHand();
}

function endHand() {
    setTimeout(() => {
        if (computerAction === 'Fold') { // TODO: felsorolt típus kell az akcióknak, hogy kisbetüvel is kezdődhessen
            playerChips += pot;
            pot = 0;
        }
        playerBets: 0;
        computerBets: 0;
        playerCards: [];
        computerCards: [];
        computerAction: null;
        deckId: null;
        playerBetPlaced: false;
        render();
    }, 2000);
}

// a belső változó felülírja a globális változót
function shouldComputerCall(computerCards) {
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
            if (pot === 4) {
                computerAction = 'Check';
                computerCards = response.cards;
            } else if (shouldComputerCall(response.cards)) { //
                computerAction = 'Call';
                computerCards = response.cards;
                // Mivel a pot-ban bent van már a 2 vak zseton
                // ezért pot - 4-et kell még betenni.
                const difference = playerBets - computerBets;
                computerChips -= difference;
                computerBets += difference;
                pot += difference;
            } else {
                computerAction = 'Fold';
            }
            render();
            endHand();
        });
}

function handleBet() {
    const betValue = parseInt($betSlider.value);
    // játékos zsetonjaiból kivonjuk a bet értékét
    playerChips -= betValue;
    // a pothoz hozzáadjuk a bet értékét 
    pot += betValue;
    // a maximális bet érték a játékos zsetonjaival egyenlő
    $betSlider.setAttribute('max', playerChips);
    // játék állapota: játékos megtette a tétjét
    playerBetPlaced = true;
    playerBets += betValue;
    render();
    computerMoveAfterBet(); // az ellenfél reakciója
}

//----------------------------------------------------------------
// Eseményfigyelők
$newGameButton.addEventListener("click", startGame);
$betSlider.addEventListener('input', render);
$betButton.addEventListener("click", handleBet)

render();
