// KONFIGURACJA
const CONFIG = {
    gameTime: 10,           // czas gry w sekundach
    baseSpeed: 10,           // prędkość przeszkód
    baseSpawnRate: 300,     // spawn co ms
    playerSpeed: 20,        // piksele ruchu gracza
    difficultyScale: 1.05   // co ile sekund wzrasta trudność
};

let gameActive = false;
let gameArea, player, statusText, scoreText, timeText;
let playerX = 180;
let obstacles = [];
let gameInterval, obstacleInterval, timerInterval;
let score = 0;
let timeLeft = CONFIG.gameTime;
let obstacleSpeed = CONFIG.baseSpeed;
let spawnRate = CONFIG.baseSpawnRate;

function startGame() {
    gameArea = document.getElementById("gameArea");
    player = document.getElementById("player");
    statusText = document.getElementById("status");
    scoreText = document.getElementById("score");
    timeText = document.getElementById("time");

    gameActive = true;
    playerX = 180;
    obstacles = [];
    score = 0;
    timeLeft = CONFIG.gameTime;
    obstacleSpeed = CONFIG.baseSpeed;
    spawnRate = CONFIG.baseSpawnRate;

    player.style.left = playerX + "px";
    statusText.innerText = "Unikaj przeszkód!";
    statusText.className = "";
    scoreText.innerText = "⭐ " + score;
    timeText.innerText = "⏳ " + timeLeft + "s";

    // spawn przeszkód
    obstacleInterval = setInterval(spawnObstacle, spawnRate);

    // update co frame
    gameInterval = setInterval(updateGame, 20);

    // odliczanie czasu
    timerInterval = setInterval(() => {
        timeLeft--;
        timeText.innerText = "⏳ " + timeLeft + "s";

        // zwiększamy trudność
        obstacleSpeed *= CONFIG.difficultyScale;
        if (spawnRate > 300) { // nie spawnuj za często
            clearInterval(obstacleInterval);
            spawnRate = spawnRate / CONFIG.difficultyScale;
            obstacleInterval = setInterval(spawnObstacle, spawnRate);
        }

        if (timeLeft <= 0) {
            endGame(true);
        }
    }, 1000);
}

function spawnObstacle() {
    if (!gameActive) return;
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    const x = Math.floor(Math.random() * (gameArea.clientWidth - 40));
    obstacle.style.left = x + "px";
    obstacle.style.top = "-40px";
    gameArea.appendChild(obstacle);
    obstacles.push(obstacle);
}

let moveLeft = false;
let moveRight = false;

function updateGame() {
    // ruch gracza
    if (moveLeft) {
        playerX = Math.max(0, playerX - CONFIG.playerSpeed * 0.5);
    }
    if (moveRight) {
        playerX = Math.min(gameArea.clientWidth - player.clientWidth, playerX + CONFIG.playerSpeed * 0.5);
    }
    player.style.left = playerX + "px";

    // przeszkody
    obstacles.forEach((obstacle, index) => {
        let top = parseInt(obstacle.style.top) || 0;
        top += obstacleSpeed;
        obstacle.style.top = top + "px";

        if (checkCollision(player, obstacle)) {
            endGame(false);
        }

        if (top > gameArea.clientHeight) {
            score++;
            scoreText.innerText = "⭐ " + score;
            obstacle.remove();
            obstacles.splice(index, 1);
        }
    });
}



function checkCollision(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.right < bRect.left ||
        aRect.left > bRect.right
    );
}

function endGame(success) {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    clearInterval(timerInterval);

    obstacles.forEach(o => o.remove());
    obstacles = [];

    if (success) {
        statusText.innerText = `✅ Sukces! Twój wynik: ${score}`;
        statusText.className = "success";
    } else {
        statusText.innerText = `❌ Porażka! Twój wynik: ${score}`;
        statusText.className = "fail";
    }

    setTimeout(() => {
        if (typeof GetParentResourceName !== "undefined") {
            fetch(`https://${GetParentResourceName()}/gameResult`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({ success, score })
            });
        }
    }, 1200);
}

// sterowanie
document.addEventListener("keydown", function(e) {
    if (!gameActive) return;
    if (e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "ArrowRight") moveRight = true;
});

document.addEventListener("keyup", function(e) {
    if (e.code === "ArrowLeft") moveLeft = false;
    if (e.code === "ArrowRight") moveRight = false;
});

// DEBUG: start automatycznie w przeglądarce
window.addEventListener("load", () => {
    startGame();
});
