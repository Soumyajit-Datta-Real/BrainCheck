let targetLetter = "P";
let score = 0;
let timeLeft = 20;
let timerInterval;
let playing = false;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function randomText(length = 200) {
  let txt = "";
  for (let i = 0; i < length; i++) {
    let ch = letters[Math.floor(Math.random() * letters.length)];
    txt += `<span class="letter" data-letter="${ch}">${ch}</span>`;
  }
  return txt;
}

function startGame() {
  playing = true;
  score = 0;
  timeLeft = 20;
  document.getElementById("score").innerText = score;
  document.getElementById("timer").innerText = timeLeft;
  document.getElementById("status").innerText = "";
  document.getElementById("text-area").innerHTML = randomText();

  // add click listeners
  document.querySelectorAll(".letter").forEach(el => {
    el.addEventListener("click", () => {
      if (!playing) return;
      if (el.dataset.letter === targetLetter) {
        el.style.color = "lime";
        score++;
        document.getElementById("score").innerText = score;
      } else {
        el.style.color = "red";
        score--;
        document.getElementById("score").innerText = score;
      }
    });
  });

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  playing = false;
  clearInterval(timerInterval);
  document.getElementById("status").innerText = "Game Over! Your score: " + score;

  // save result
  fetch("/save_score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({game: "letter_spotting", score: score})
  });
}

document.getElementById("start-btn").addEventListener("click", startGame);
