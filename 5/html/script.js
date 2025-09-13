let sequence = [];
let playerInput = [];
let round = 1;
let active = false;
let maxRounds = 3; // domyślnie "easy"

function startSimonGame(difficulty) {
    sequence = [];
    playerInput = [];
    round = 1;
    active = false;

    if (difficulty === "medium") maxRounds = 5;
    else if (difficulty === "hard") maxRounds = 7;
    else maxRounds = 3; // easy

    document.getElementById("status").innerText = "Zapamiętaj sekwencję!";
    nextRound();
}

function nextRound() {
    playerInput = [];
    sequence.push(randomColor());
    playSequence();
}

function randomColor() {
    const colors = ["red", "yellow", "green", "blue"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function playSequence() {
    active = false;
    let i = 0;

    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            document.getElementById("status").innerText = "Twoja kolej!";
            active = true;
            return;
        }
        flash(sequence[i]);
        i++;
    }, 800);
}

function flash(color) {
    const btn = document.getElementById(color);
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 500);
}

function handlePlayerInput(color) {
    if (!active) return;

    playerInput.push(color);
    flash(color);

    // sprawdzanie na bieżąco
    for (let i = 0; i < playerInput.length; i++) {
        if (playerInput[i] !== sequence[i]) {
            endGame(false);
            return;
        }
    }

    // jeśli gracz podał całą sekwencję poprawnie
    if (playerInput.length === sequence.length) {
        if (round >= maxRounds) {
            endGame(true);
        } else {
            round++;
            document.getElementById("status").innerText = "Dobra robota! Runda " + round + "/" + maxRounds;
            setTimeout(nextRound, 1200);
        }
    }
}

function endGame(success) {
    active = false;
    if (success) {
        document.getElementById("status").innerText = "✅ Sukces!";
        document.getElementById("status").className = "success";
    } else {
        document.getElementById("status").innerText = "❌ Porażka!";
        document.getElementById("status").className = "fail";
    }

    setTimeout(() => {
        if (typeof GetParentResourceName !== "undefined") {
            fetch(`https://${GetParentResourceName()}/gameResult`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify(success)
            });
        }
    }, 1200);
}

// obsługa kliknięć
document.querySelectorAll(".simonBtn").forEach(btn => {
    btn.addEventListener("click", () => handlePlayerInput(btn.id));
});

// odbiór z Lua
window.addEventListener("message", function(event) {
    if (event.data.action === "startSimon") {
        startSimonGame(event.data.difficulty);
    }
});

// DEBUG w przeglądarce
window.addEventListener("load", () => {
    startSimonGame("easy");
});
