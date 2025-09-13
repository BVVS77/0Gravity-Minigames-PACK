let active = false;
let greenTime = null;

function startGame() {
    const red = document.getElementById("red");
    const yellow = document.getElementById("yellow");
    const green = document.getElementById("green");
    const status = document.getElementById("status");

    red.classList.add("active");
    yellow.classList.remove("active");
    green.classList.remove("active");
    status.innerText = "Czekaj na zielone...";
    status.className = "";
    active = true;
    greenTime = null;

    setTimeout(() => {
        if (!active) return;
        red.classList.remove("active");
        yellow.classList.add("active");
        status.innerText = "Przygotuj się...";
    }, 2000);

    let delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
        if (!active) return;
        yellow.classList.remove("active");
        green.classList.add("active");
        status.innerText = "Kliknij teraz (E / Spacja)";
        greenTime = Date.now();
    }, delay);
}

function checkReaction() {
    const status = document.getElementById("status");
    if (!active) return;

    if (!greenTime) {
        status.innerText = "❌ Za wcześnie!";
        status.className = "fail";
        return endGame(false);
    }

    let reaction = Date.now() - greenTime;
    if (reaction <= 500) {
        status.innerText = "✅ Sukces! (" + reaction + "ms)";
        status.className = "success";
        endGame(true);
    } else {
        status.innerText = "❌ Za wolno! (" + reaction + "ms)";
        status.className = "fail";
        endGame(false);
    }
}

function endGame(success) {
    active = false;
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

// obsługa klawiszy
document.addEventListener("keydown", function(e) {
    if (e.code === "KeyE" || e.code === "Space") {
        checkReaction();
    }
});

// DEBUG do przeglądarki
window.addEventListener("load", () => {
    startGame(); // automatycznie startuje w podglądzie
});
