const playArea = {};
const player = {};
let tilesAssets;
const ROWS_NUMBER = 4;
const COLS_NUMBER = 4;
const COL_WIDTH = 100;
const DEFAULT_LIVES_COUNT = 3;
const DEFAULT_HEADER_TEXT = 'Press the button to start';

init();

function init() {    
    loadTilesAssets();
    setPlayAreas();
    setupNewGameButton();
    resetGameValues();
    buildBoard();
}

function loadTilesAssets() {
    fetch('https://raw.githubusercontent.com/backendprincess/quick-click-popper-game/master/iconsData.json'
    ).then(function(rep) {
        return rep.json();
    }).then(function(data) {
        tilesAssets = data.data;
    });
}

function setPlayAreas() {
    playArea.stats = document.querySelector('.stats');
    playArea.main = document.querySelector('.main');
    playArea.game = document.querySelector('.game');
    playArea.scorer = document.querySelector('.scorer');
    playArea.scorer.innerHTML = DEFAULT_HEADER_TEXT;
}

function setupNewGameButton() {
    const newGameButton = document.querySelector('.new-game');
    newGameButton.addEventListener('click', handleStartNewGameTapped);
}

function resetGameValues() {
    player.isGameOver = false;
    player.score = 0;
    player.lives = DEFAULT_LIVES_COUNT;
}

function buildBoard() {
    makeVisible(playArea.main, true);

    playArea.game.style.width = COLS_NUMBER * COL_WIDTH + COLS_NUMBER * 2;
    playArea.game.style.margin = 'auto';

    for (let currRowNumber = 0; currRowNumber < ROWS_NUMBER; ++currRowNumber) {    
        let rowElement = getNewRowWithTiles(currRowNumber);    
        playArea.game.appendChild(rowElement);
    }
}

function handleStartNewGameTapped(e) {
    startGame();
}

function startGame() {
    makeVisible(playArea.main, false);
    makeVisible(playArea.game, true);
    resetGameValues();
    startPoppingTiles();
}

function getNewRowWithTiles(rowNumber) {
    let rowElement = getNewRowElement();

    for (let currColNumber = 0; currColNumber < COLS_NUMBER; ++currColNumber) {
        const tileNumber = rowNumber * COLS_NUMBER + currColNumber;
        appendNewTile(rowElement, tileNumber);
    }

    return rowElement;
}

function getNewRowElement() {
    let rowElement = document.createElement('div');
    rowElement.setAttribute('class', 'row');
    rowElement.style.width = COLS_NUMBER * COL_WIDTH + COLS_NUMBER * 2;

    return rowElement;
}

function appendNewTile(rowElement, tileNumber) {
    let tileElement = document.createElement('div');
    tileElement.setAttribute('class', 'tile');
    tileElement.innerText = tileNumber;
    rowElement.appendChild(tileElement);
}

function setTileActive(tile, isActive) {
    if (isActive) {
        tile.classList.add('active');
        tile.addEventListener('click', handlePoppedTileTapped);
        displayTileValue(tile);
    } else {
        tile.classList.remove('active');
        tile.removeEventListener('click', handlePoppedTileTapped);
        tile.innerText = tile.tileNumber;
    }    
}

function startPoppingTiles() {
    let tileToPop = getRandomTile();
    setTileActive(tileToPop, true);

    const time = Math.round(Math.random() * 1500 + 750);    
    playArea.deactivateTile = setTimeout(() => {
        setTileActive(tileToPop, false);
        const didLoseLife = tileToPop.tileValue > 0;
        if (didLoseLife) {
            decrementLives();
        }

        if (!player.isGameOver) {
            startPoppingTiles();
        }
    }, time);

    updateScorePanel();
}

function getRandomTile() {
    const tiles = document.querySelectorAll('.tile');
    const randomIndex = Math.floor(Math.random() * tiles.length);
    if (randomIndex === playArea.lastPoppedTileIndex) {
        return getRandomTile();
    }

    playArea.lastPoppedTileIndex = randomIndex;
    return tiles[randomIndex];
}

function displayTileValue(tileToPop) {
    const randomIndex = Math.floor(Math.random() * tilesAssets.length);
    tileToPop.tileNumber = tileToPop.innerText;
    tileToPop.tileValue = tilesAssets[randomIndex].value;

    const newTileText = `${tilesAssets[randomIndex].icon} <br> ${tilesAssets[randomIndex].value}`;
    tileToPop.innerHTML = newTileText;
}

function decrementLives() {
    --player.lives;
    updateScorePanel();

    const outOfLives = player.lives <= 0;
    setGameOver(outOfLives);
}

function handlePoppedTileTapped(e) {
    let poppedTile = e.target;
    player.score = player.score + poppedTile.tileValue;
    updateScorePanel();
    
    setTileActive(poppedTile, false);
    clearTimeout(playArea.deactivateTile);

    if (!player.isGameOver) {
        startPoppingTiles();
    }
}

function updateScorePanel() {
    playArea.scorer.innerHTML = `Score: ${player.score} Lives: ${player.lives}`;
}

function setGameOver(isGameOver) {
    player.isGameOver = isGameOver;
    if (isGameOver) {
        returnToMainPage();
    }
}

function returnToMainPage() {
    makeVisible(playArea.main, true);
    makeVisible(playArea.game, false);
    
    playArea.scorer.innerHTML = DEFAULT_HEADER_TEXT;
}

function makeVisible(element, isVisible) {
    if (isVisible) {
        element.classList.add('visible');
    } else {
        element.classList.remove('visible');
    }    
}