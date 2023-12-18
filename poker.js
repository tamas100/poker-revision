const $newGameButton = document.querySelector(".js-new-game-button");
const playerCardsContainer = document.querySelector(".js-player-cards-container");

// program state - program állapota
let deckId = null; // nem definiált érték
let playerCards = [];

playerCardsContainer.innerHTML = "Ide jönnek majd a lapok.";


function renderPlayerCards(playerCards) {
    // let html = `        
    //     <img src="${playerCards[0].image}" alt="playercards[0].code"/>        
    //     <img src="${playerCards[1].image}" alt="playercards[0].code"/>    
    //     `
    // ;

    let html = ``;

    for (let card of playerCards) {
        html += `<img src="${card.image}" alt="${card.code}"/>`
    }
    playerCardsContainer.innerHTML = html;
}

function drawAndRenderPlayerCards() {
    if (deckId === null) return; // ha nincs deckId kilép
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
        .then(data => data.json())
        .then(response => {
            playerCards = response.cards;
            renderPlayerCards(playerCards);
        });
}

function startGame() {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then(data => data.json())
        .then(response => {
            deckId = response.deck_id;
            drawAndRenderPlayerCards();
        });
}


$newGameButton.addEventListener("click", startGame);