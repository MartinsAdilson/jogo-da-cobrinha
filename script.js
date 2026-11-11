// Telas
const introScreen = document.getElementById('intro-screen');
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const recordsScreen = document.getElementById('records-screen');
const gameOverScreen = document.getElementById('game-over-screen');

// Elementos da Interface
const btnNewGame = document.getElementById('btn-new-game');
const btnRecords = document.getElementById('btn-records');
const btnBackMenu = document.getElementById('btn-back-menu');
const btnBackFromGameOver = document.getElementById('btn-back-from-gameover');
const btnSaveRecord = document.getElementById('btn-save-record');
const scoreDisplay = document.getElementById('current-score-display');
const finalScoreText = document.getElementById('final-score');
const newRecordBox = document.getElementById('new-record-box');
const inputInitials = document.getElementById('player-initials');
const highScoreList = document.getElementById('high-score-list');

// Configurações do Jogo
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const box = 20; 
let game; 
let score = 0;
let snake = [];
let direcao;
let food = {};
let specialFood = {};

let top10Records = JSON.parse(localStorage.getItem("snakeTop10")) || [];

// === TRANSIÇÃO DA INTRODUÇÃO PARA O MENU ===
// Aguarda 2.5 segundos (tempo da animação no CSS) e troca de tela
setTimeout(() => {
    introScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}, 2500);

// === NAVEGAÇÃO ===
btnNewGame.addEventListener('click', () => {
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetGame();
    game = setInterval(draw, 100);
});

btnRecords.addEventListener('click', () => {
    atualizarTelaDeRecordes();
    menuScreen.classList.add('hidden');
    recordsScreen.classList.remove('hidden');
});

btnBackMenu.addEventListener('click', () => {
    recordsScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
});

btnBackFromGameOver.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
});

// === LÓGICA DE SALVAR RECORDE ===
btnSaveRecord.addEventListener('click', () => {
    let initials = inputInitials.value.toUpperCase();
    if (initials.trim() === "") initials = "AAA";

    top10Records.push({ nome: initials, pontos: score });
    top10Records.sort((a, b) => b.pontos - a.pontos);
    top10Records = top10Records.slice(0, 10);

    localStorage.setItem("snakeTop10", JSON.stringify(top10Records));

    gameOverScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
});

function atualizarTelaDeRecordes() {
    highScoreList.innerHTML = '';
    
    if (top10Records.length === 0) {
        highScoreList.innerHTML = "<li>Nenhum recorde ainda.</li>";
        return;
    }

    top10Records.forEach((record, index) => {
        let li = document.createElement('li');
        li.innerHTML = `<span>#${index + 1} ${record.nome}</span> <span>${record.pontos}</span>`;
        highScoreList.appendChild(li);
    });
}

// === CONTROLES DO JOGO ===
document.addEventListener("keydown", (event) => {
    let key = event.keyCode;
    if (key == 37 && direcao != "RIGHT") direcao = "LEFT";
    else if (key == 38 && direcao != "DOWN") direcao = "UP";
    else if (key == 39 && direcao != "LEFT") direcao = "RIGHT";
    else if (key == 40 && direcao != "UP") direcao = "DOWN";
});

function resetGame() {
    score = 0;
    scoreDisplay.innerText = "Pontos: 0";
    direcao = undefined;
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box };
    
    food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
    specialFood = { x: -1, y: -1, active: false, timer: 0 };
}

function checkCollision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

// === MOTOR DO JOGO ===
function draw() {
    ctx.fillStyle = "#16213e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#4CAF50" : "#81C784";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#16213e";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#e94560";
    ctx.fillRect(food.x, food.y, box, box);

    if (!specialFood.active) {
        if (Math.random() < 0.02) {
            specialFood.x = Math.floor(Math.random() * 20) * box;
            specialFood.y = Math.floor(Math.random() * 20) * box;
            specialFood.active = true;
            specialFood.timer = 50;
        }
    } else {
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(specialFood.x, specialFood.y, box, box);
        specialFood.timer--;
        if (specialFood.timer <= 0) specialFood.active = false;
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direcao == "LEFT") snakeX -= box;
    if (direcao == "UP") snakeY -= box;
    if (direcao == "RIGHT") snakeX += box;
    if (direcao == "DOWN") snakeY += box;

    let comeuNormal = (snakeX == food.x && snakeY == food.y);
    let comeuEspecial = (specialFood.active && snakeX == specialFood.x && snakeY == specialFood.y);

    if (comeuNormal) {
        score++;
        scoreDisplay.innerText = "Pontos: " + score;
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
    } else if (comeuEspecial) {
        score += 5;
        scoreDisplay.innerText = "Pontos: " + score;
        specialFood.active = false;
        snake.pop();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || checkCollision(newHead, snake)) {
        clearInterval(game);
        
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
        finalScoreText.innerText = score;

        let isTop10 = false;
        if (top10Records.length < 10) {
            isTop10 = true;
        } else {
            let piorDoTop10 = top10Records[top10Records.length - 1].pontos;
            if (score > piorDoTop10) isTop10 = true;
        }

        if (isTop10 && score > 0) {
            newRecordBox.classList.remove('hidden');
            inputInitials.value = "";
            inputInitials.focus();
        } else {
            newRecordBox.classList.add('hidden');
        }

        return;
    }

    snake.unshift(newHead);
}