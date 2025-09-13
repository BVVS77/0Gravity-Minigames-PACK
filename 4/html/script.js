let timer;
let timeLimit = 5000; // 5 sekund
let timeLeft = timeLimit;
let targetWord = "";
let active = false;

function startTypingGame() {
    const words = [
        "gravity", "los_santos", "reaction", "speed", 
        "keyboard", "fivem", "zerogravity", "challenge", 
        "coding", "esx", "pistol", "server", "dynamic"
    ];

    targetWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById("word").innerText = targetWord;
    document.getElementById("status").innerText = "Masz 5 sekund!";
    document.getElementById("status").className = "";
    document.getElementById("input").value = "";
    document.getElementById("input").focus();

    timeLeft = timeLimit;
    active = true;
    updateTimer();

    timer = setInterval(() => {
        timeLeft -= 100;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endTypingGame(false);
        }
        updateTimer();
    }, 100);
}

function updateTimer() {
    const percent = (timeLeft / timeLimit) * 100;
    document.getElementById("timeLeft").style.width = percent + "%";

    let seconds = Math.ceil(timeLeft / 1000);
    document.getElementById("countdown").innerText = seconds + "s";

    if (percent < 30) {
        document.getElementById("timeLeft").style.background = "#ff3b3b";
    } else if (percent < 60) {
        document.getElementById("timeLeft").style.background = "#ffd633";
    } else {
        document.getElementById("timeLeft").style.background = "#33cc66";
    }
}


function checkInput() {
    if (!active) return;
    const val = document.getElementById("input").value.trim();
    if (val === targetWord) {
        clearInterval(timer);
        endTypingGame(true);
    }
}

function endTypingGame(success) {
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

// sprawdzanie wpisywania
document.getElementById("input").addEventListener("input", checkInput);

// odbiór z Lua
window.addEventListener("message", function(event) {
    if (event.data.action === "startTyping") {
        startTypingGame();
    }
});

// DEBUG do przeglądarki
window.addEventListener("load", () => {
    startTypingGame();
});
