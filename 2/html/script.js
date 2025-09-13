let sequence = [];
let step = 0;
let active = false;
let showing = true;
let timerInterval;

const keys = [
  "ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
  "KeyQ","KeyW","KeyE","KeyR","KeyF","KeyG"
];

const difficulties = {
  easy: { min: 4, max: 5, time: 15000 },
  medium: { min: 6, max: 8, time: 12000 },
  hard: { min: 9, max: 12, time: 10000 }
};

let difficulty = "medium";

function startMemoryGame() {
  const seqContainer = document.getElementById("sequence");
  const btnContainer = document.getElementById("buttons");
  const status = document.getElementById("status");

  seqContainer.innerHTML = "";
  btnContainer.innerHTML = "";
  sequence = [];
  step = 0;
  active = true;
  showing = true;

  status.innerText = "Zapamiętaj sekwencję...";
  status.className = "";

  const len = randomInt(difficulties[difficulty].min, difficulties[difficulty].max);
  for (let i = 0; i < len; i++) {
    sequence.push(keys[Math.floor(Math.random() * keys.length)]);
  }

  // render sekwencji tymczasowo
  sequence.forEach(k => {
    let div = document.createElement("div");
    div.className = "keyBox";
    div.innerText = formatKey(k);
    seqContainer.appendChild(div);
  });

  // pokazujemy animacją i chowamy
  showSequence().then(() => {
    seqContainer.innerHTML = "";
    status.innerText = "Powtarzaj sekwencję!";
    showing = false;
    renderButtons();
    startTimer(difficulties[difficulty].time);
  });
}

function renderButtons() {
  const btnContainer = document.getElementById("buttons");
  btnContainer.innerHTML = "";
  let shuffled = shuffle(keys).slice(0, 12);
  shuffled.forEach(k => {
    let div = document.createElement("div");
    div.className = "keyBox";
    div.innerText = formatKey(k);
    div.dataset.key = k;
    div.addEventListener("click", () => handleInput(k, div));
    btnContainer.appendChild(div);
  });
}

function handleInput(key, div) {
  if (!active || showing) return;

  if (sequence[step] === key) {
    div.classList.add("active");
    step++;
    if (step >= sequence.length) {
      document.getElementById("status").innerText = "✅ SUCCESS!";
      document.getElementById("status").className = "success";
      stopTimer();
      active = false;
      sendResult(true);
    }
  } else {
    div.classList.add("wrong");
    document.getElementById("status").innerText = "❌ FAILED!";
    document.getElementById("status").className = "fail";
    stopTimer();
    active = false;
    sendResult(false);
  }
}

function showSequence() {
  return new Promise(resolve => {
    const boxes = document.querySelectorAll("#sequence .keyBox");
    let i = 0;
    const interval = setInterval(() => {
      boxes.forEach(b => b.classList.remove("active"));
      boxes[i].classList.add("active");
      setTimeout(() => boxes[i].classList.remove("active"), 400);
      i++;
      if (i >= boxes.length) {
        clearInterval(interval);
        resolve();
      }
    }, 800);
  });
}

function startTimer(time) {
  const bar = document.getElementById("timeBar");
  const start = Date.now();
  timerInterval = setInterval(() => {
    let elapsed = Date.now() - start;
    let progress = Math.max(0, time - elapsed);
    let percent = (progress / time) * 100;
    bar.style.width = percent + "%";
    if (progress <= 0) {
      clearInterval(timerInterval);
      document.getElementById("status").innerText = "⏰ TIME UP!";
      document.getElementById("status").className = "fail";
      active = false;
      sendResult(false);
    }
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatKey(key) {
  switch(key) {
    case "ArrowUp": return "↑";
    case "ArrowDown": return "↓";
    case "ArrowLeft": return "←";
    case "ArrowRight": return "→";
    case "KeyQ": return "Q";
    case "KeyW": return "W";
    case "KeyE": return "E";
    case "KeyR": return "R";
    case "KeyF": return "F";
    case "KeyG": return "G";
  }
  return key;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function sendResult(success) {
  setTimeout(() => {
    if (typeof GetParentResourceName !== "undefined") {
      fetch(`https://${GetParentResourceName()}/gameResult`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(success)
      });
    }
  }, 1000);
}

// klawiatura
document.addEventListener("keydown", e => {
  if (!active || showing) return;
  if (!keys.includes(e.code)) return;
  const btn = [...document.querySelectorAll(".keyBox")].find(b => b.dataset.key === e.code);
  if (btn) handleInput(e.code, btn);
});

// DEBUG podgląd w przeglądarce
window.addEventListener("load", () => {
  startMemoryGame();
});
