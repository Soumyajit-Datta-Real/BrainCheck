let startTime = null;
let bestTime = null;
let timeoutId = null;

const btn = document.getElementById("reaction-btn");
const reactionTimeEl = document.getElementById("reaction-time");
const bestTimeEl = document.getElementById("best-time");
const statusEl = document.getElementById("status");

function startRound() {
  btn.disabled = true;
  btn.innerText = "Wait...";
  btn.style.backgroundColor = "#444";
  statusEl.innerText = "";

  // random delay (2-5 sec)
  const delay = Math.floor(Math.random() * 3000) + 2000;

  timeoutId = setTimeout(() => {
    btn.disabled = false;
    btn.innerText = "CLICK!";
    btn.style.backgroundColor = "#0f0";
    startTime = Date.now();
  }, delay);
}

btn.addEventListener("click", () => {
  if (!startTime) {
    // clicked too early
    clearTimeout(timeoutId);
    statusEl.innerText = "❌ Too early! Try again.";
    startTime = null;
    setTimeout(startRound, 1000);
    return;
  }

  const reactionTime = Date.now() - startTime;
  reactionTimeEl.innerText = reactionTime;

  if (bestTime === null || reactionTime < bestTime) {
    bestTime = reactionTime;
    bestTimeEl.innerText = bestTime;
  }

  // save result
  fetch("/save_score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({game: "reaction_speed", score: reactionTime})
  });

  statusEl.innerText = "✅ Recorded!";
  startTime = null;
  setTimeout(startRound, 1500);
});

window.onload = () => {
  startRound();
};
