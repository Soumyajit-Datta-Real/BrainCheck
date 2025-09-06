const pads = ["red", "green", "blue", "yellow"];
let sequence = [];
let playerSequence = [];
let level = 0;
let canClick = false;

const sounds = {
  red: new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"),
  green: new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),
  blue: new Audio("https://actions.google.com/sounds/v1/cartoon/wood_whack.ogg"),
  yellow: new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg")
};

const levelDisplay = document.getElementById("level");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

pads.forEach(color => {
  document.getElementById(color).addEventListener("click", () => handlePadClick(color));
});

function startGame() {
  sequence = [];
  playerSequence = [];
  level = 0;
  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");
  nextRound();
}

function nextRound() {
  level++;
  levelDisplay.textContent = level;
  playerSequence = [];
  const nextColor = pads[Math.floor(Math.random() * pads.length)];
  sequence.push(nextColor);

  playSequence();
}

function playSequence() {
  let delay = 0;
  canClick = false;

  sequence.forEach((color, index) => {
    setTimeout(() => {
      flash(color);
      sounds[color].play();
    }, delay);
    delay += 700;
  });

  setTimeout(() => { canClick = true; }, delay);
}

function flash(color) {
  const pad = document.getElementById(color);
  pad.classList.add("active");
  setTimeout(() => pad.classList.remove("active"), 400);
}

function handlePadClick(color) {
  if (!canClick) return;

  playerSequence.push(color);
  flash(color);
  sounds[color].play();

  const currentStep = playerSequence.length - 1;
  if (playerSequence[currentStep] !== sequence[currentStep]) {
    gameOver();
    return;
  }

  if (playerSequence.length === sequence.length) {
    setTimeout(() => nextRound(), 1000);
  }
}

function gameOver() {
  alert(`Game Over! You reached level ${level}`);
  restartBtn.classList.remove("hidden");
  canClick = false; // Prevent further clicks

  fetch("/submit_score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game: "Pattern Sequencing", score: level })
  });
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
