// ====== KONFIG DOMYŚLNA (może być nadpisana przez SendNUIMessage) ======
let cfg = {
  difficulty: "medium",      // easy | medium | hard | custom
  rounds: 3,                 // liczba rund do zaliczenia
  triesPerRound: 1,          // ile prób na rundę
  roundTimeMs: 7000,         // czas na rundę (0 = bez timera)
  patterns: ["pingpong"],    // pingpong | sine | accel
  baseSpeed: 1.0,            // bazowa prędkość (px/ms względnie paska)
  zoneMin: 0.16,             // minimalna szer. strefy (część 0..1) dla losowania
  zoneMax: 0.28,             // maksymalna szer. strefy
  jitter: 0.0,               // losowe drgania wskaźnika (0..1)
  scoreWin: 100,             // bazowe punkty za trafienie
  scorePerfectBonus: 50,     // bonus za idealny środek strefy
  perfectThreshold: 0.1,     // 0..1: środek strefy ±10% jej szerokości = perfect
  allowMouse: true           // pozwól kliknąć pasek myszką jako "stop"
};

// presety trudności
const PRESETS = {
  easy:   { rounds: 2, triesPerRound: 2, roundTimeMs: 9000, baseSpeed: 0.7, zoneMin: 0.22, zoneMax: 0.32, jitter: 0.0 },
  medium: { rounds: 3, triesPerRound: 1, roundTimeMs: 7000, baseSpeed: 1.0, zoneMin: 0.16, zoneMax: 0.26, jitter: 0.05 },
  hard:   { rounds: 4, triesPerRound: 1, roundTimeMs: 6000, baseSpeed: 1.3, zoneMin: 0.12, zoneMax: 0.20, jitter: 0.08 }
};

let state = {
  active: false,
  round: 1,
  score: 0,
  combo: 0,
  triesLeft: 0,
  timer: null,
  timeEnd: 0,
  // bar geometry
  barEl: null,
  zoneEl: null,
  indEl: null,
  barW: 0,
  zoneStartPx: 0,
  zoneEndPx: 0,
  // movement
  x: 0,
  dir: 1,     // 1 -> right, -1 -> left
  lastTs: 0
};

// ====== START GRY (FiveM -> NUI) ======
window.addEventListener("message", (e) => {
  if (e.data?.action === "startStopBar") {
    startGame(e.data.settings || {});
  }
});

// ====== DEBUG (podgląd w przeglądarce) ======
window.addEventListener("load", () => {
  // pokaż panel w przeglądarce
  document.getElementById("gameRoot").style.display = "flex";
  // odpal demo tylko w przeglądarce (w FiveM GetParentResourceName istnieje)
  if (typeof GetParentResourceName === "undefined") {
    startGame({ difficulty: "medium" });
  }
});

// ====== Sterowanie ======
document.addEventListener("keydown", (e) => {
  if (!state.active) return;
  if (e.code === "Space" || e.code === "KeyE") stopNow();
});
if (cfg.allowMouse){
  document.getElementById("bar").addEventListener("click", () => {
    if (!state.active) return;
    stopNow();
  });
}

// ====== Logika gry ======
function startGame(overrides = {}) {
  // wczytaj preset
  const diff = overrides.difficulty || cfg.difficulty;
  const base = PRESETS[diff] ? PRESETS[diff] : {};
  cfg = { ...cfg, ...base, ...overrides, difficulty: diff };

  // UI
  document.getElementById("gameRoot").style.display = "flex";
  setText("round", 1);
  setText("rounds", cfg.rounds);
  setText("tries", cfg.triesPerRound);
  setText("score", 0);
  setText("combo", 0);
  setStatus("");

  // referencje
  state.barEl = document.getElementById("bar");
  state.zoneEl = document.getElementById("successZone");
  state.indEl  = document.getElementById("indicator");

  state.barW = state.barEl.clientWidth;

  state.round = 1;
  state.score = 0;
  state.combo = 0;

  nextRound();
}

function nextRound(){
  state.triesLeft = cfg.triesPerRound;
  setText("round", state.round);
  setText("tries", state.triesLeft);
  setText("combo", state.combo);

  // losowa strefa
  const zoneFrac = rand(cfg.zoneMin, cfg.zoneMax);
  const zoneW = zoneFrac * state.barW;
  const zoneStart = rand(0.05, 0.95 - zoneFrac) * state.barW;

  state.zoneStartPx = zoneStart;
  state.zoneEndPx   = zoneStart + zoneW;

  state.zoneEl.style.left  = `${zoneStart}px`;
  state.zoneEl.style.width = `${zoneW}px`;

  // start wskaźnika (losowy brzeg i kierunek)
  state.x = Math.random() < 0.5 ? 2 : state.barW - 8;
  state.dir = state.x < state.barW / 2 ? 1 : -1;

  // timer
  stopTimer();
  if (cfg.roundTimeMs > 0) {
    state.timeEnd = performance.now() + cfg.roundTimeMs;
    startTimer(cfg.roundTimeMs);
  } else {
    setText("time", "∞");
  }

  state.active = true;
  state.lastTs = performance.now();
  requestAnimationFrame(tick);
}

function tick(ts){
  if (!state.active) return;

  // dt
  const dt = Math.max(0, Math.min(32, ts - state.lastTs)); // clamp
  state.lastTs = ts;

  // wybór patternu ruchu (możesz podać kilka w cfg.patterns – losujemy jedną na rundę)
  const pattern = cfg._currentPattern || pickPattern();
  cfg._currentPattern = pattern;

  // prędkość
  let v = cfg.baseSpeed;

  // modyfikatory patternów
  if (pattern === "sine"){
    // zmiana prędkości w czasie (sinus)
    const t = ts * 0.003;
    v *= 0.6 + 0.4 * (1 + Math.sin(t)); // 0.6..1.4 * base
  } else if (pattern === "accel"){
    // przyspieszanie i odbicie
    v *= 1.0 + 0.0008 * (ts % 4000); // rosnąca prędkość w cyklu
  }

  // jitter (losowe mikro-drgania)
  const j = cfg.jitter > 0 ? (Math.random() - 0.5) * cfg.jitter * 8 : 0;

  // integracja
  state.x += state.dir * v * dt + j;

  // odbicia na krawędziach
  if (state.x <= 0)  { state.x = 0;  state.dir = 1; }
  if (state.x >= state.barW - 6) { state.x = state.barW - 6; state.dir = -1; }

  // update wskaźnika
  state.indEl.style.left = `${state.x}px`;

  // timer
  if (cfg.roundTimeMs > 0) {
    const left = Math.max(0, state.timeEnd - ts);
    const pc = left / cfg.roundTimeMs;
    setText("time", (left/1000).toFixed(1) + "s");
    document.getElementById("timeBar").style.width = (pc * 100) + "%";
    if (left <= 0) {
      // czas minął = fail próby
      roundFail("⏰ Czas minął!");
      return;
    }
  }

  requestAnimationFrame(tick);
}

function stopNow(){
  if (!state.active) return;

  // trafienie?
  const inZone = state.x + 3 >= state.zoneStartPx && state.x + 3 <= state.zoneEndPx;

  if (inZone){
    // ideal?
    const zoneMid = (state.zoneStartPx + state.zoneEndPx) / 2;
    const zoneW   = (state.zoneEndPx - state.zoneStartPx);
    const dist    = Math.abs((state.x + 3) - zoneMid);
    const isPerfect = dist <= zoneW * cfg.perfectThreshold;

    // punkty + combo
    const gain = cfg.scoreWin + (isPerfect ? cfg.scorePerfectBonus : 0) + Math.floor(state.combo * 10);
    state.score += gain;
    state.combo += 1;

    // UI feedback
    flashPanel(true);
    setStatus(isPerfect ? `✅ PERFECT! +${gain}` : `✅ Trafienie! +${gain}`, true);
    setText("score", state.score);
    setText("combo", state.combo);

    // kolejna runda lub koniec
    state.active = false;
    stopTimer();
    setTimeout(() => {
      if (state.round >= cfg.rounds){
        endGame(true);
      } else {
        state.round++;
        nextRound();
      }
    }, 450);

  } else {
    roundFail("❌ Pudło!");
  }
}

function roundFail(msg){
  state.triesLeft -= 1;
  setText("tries", Math.max(0, state.triesLeft));
  state.combo = 0;
  flashPanel(false);
  setStatus(msg, false);

  if (state.triesLeft <= 0){
    state.active = false;
    stopTimer();
    setTimeout(() => endGame(false), 400);
  } else {
    // restart bieżącej rundy z nową strefą
    state.active = false;
    stopTimer();
    setTimeout(() => nextRound(), 400);
  }
}

function endGame(success){
  setStatus(success ? "🎉 SUKCES!" : "💥 PORAŻKA!", success);
  // callback do FiveM
  setTimeout(() => {
    if (typeof GetParentResourceName !== "undefined") {
      fetch(`https://${GetParentResourceName()}/gameResult`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ success, score: state.score })
      });
    }
  }, 450);
}

// ====== Timer HUD ======
function startTimer(ms){
  const end = performance.now() + ms;
  state.timeEnd = end;
}
function stopTimer(){
  // nic – liczony w tick; tu tylko utrzymujemy zgodność nazewnictwa
}

// ====== Helpers UI ======
function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = v; }
function setStatus(txt, ok){
  const st = document.getElementById("status");
  st.className = ok === undefined ? "" : (ok ? "successText" : "failText");
  st.textContent = txt || "";
}
function flashPanel(isOk){
  const p = document.getElementById("panel");
  p.classList.remove("flash-success","flash-fail");
  void p.offsetWidth; // restart animacji
  p.classList.add(isOk ? "flash-success" : "flash-fail");
}
function rand(a,b){ return a + Math.random()*(b-a); }

function pickPattern(){
  // losujemy jedną z dozwolonych na rundę
  const arr = Array.isArray(cfg.patterns) ? cfg.patterns : [String(cfg.patterns)];
  return arr[Math.floor(Math.random()*arr.length)] || "pingpong";
}
