const numberDisplay = document.getElementById("number-display");
const nSelect = document.getElementById("nSelect");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const attemptsEl = document.getElementById("attempts");
const nBackVal = document.getElementById("n-back-val");
const statusEl = document.getElementById("status");

let sequence = [];
let currentIndex = 0;
let n = 2;
let score = 0;
let attempts = 0;
let gameActive = false;
let intervalId = null;

// generate random integer 0–9
function getRandomNumber() {
  return Math.floor(Math.random() * 10);
}

function showNextNumber() {
  const num = getRandomNumber();
  sequence.push(num);
  currentIndex = sequence.length - 1;
  numberDisplay.innerText = num;
  statusEl.innerText = "";
}

function checkMatch() {
  if (!gameActive) return;
  attempts++;
  if (currentIndex >= n && sequence[currentIndex] === sequence[currentIndex - n]) {
    score++;
    statusEl.innerText = "✅ Correct!";
  } else {
    statusEl.innerText = "❌ Wrong!";
  }
  updateStats();
}

function updateStats() {
  scoreEl.innerText = score;
  attemptsEl.innerText = attempts;
}

function startGame() {
  clearInterval(intervalId);
  sequence = [];
  score = 0;
  attempts = 0;
  updateStats();
  n = parseInt(nSelect.value, 10);
  nBackVal.innerText = n;
  gameActive = true;

  intervalId = setInterval(showNextNumber, 2000); // show every 2 sec
  showNextNumber();
}

function endGame() {
  clearInterval(intervalId);
  gameActive = false;

  // save result
  fetch("/save_score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game: "number_recall",
      score: score,
      attempts: attempts,
      n_back: n
    })
  });

  statusEl.innerText = `🏁 Game over! Final Score: ${score}/${attempts}`;
}

startBtn.addEventListener("click", startGame);

// spacebar handler
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    checkMatch();
  } else if (e.code === "Escape") {
    endGame();
  }
});
