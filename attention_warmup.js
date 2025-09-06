const gameArea = document.getElementById("gameArea");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");

let score = 0;
let timeLeft = 30;
let timer;
let redCircles = [];

function spawnFixedRedCircles() {
  // Fixed positions for 5 red circles
  const positions = [
    { top: 50, left: 80 },
    { top: 120, left: 300 },
    { top: 250, left: 180 },
    { top: 320, left: 500 },
    { top: 60, left: 450 },
  ];
  positions.forEach((pos) => {
    const circle = document.createElement("div");
    circle.className = "circle";
    circle.style.width = "50px";
    circle.style.height = "50px";
    circle.style.borderRadius = "50%";
    circle.style.position = "absolute";
    circle.style.top = pos.top + "px";
    circle.style.left = pos.left + "px";
    circle.style.background = "red";
    circle.style.cursor = "pointer";
    gameArea.appendChild(circle);
    redCircles.push(circle);

    circle.addEventListener("mouseover", () => {
      if (!circle.classList.contains("scored")) {
        score++;
        scoreEl.textContent = "Score: " + score;
        circle.classList.add("scored");
        circle.style.opacity = "0.5";
      }
    });
  });
}

function startGame() {
  spawnFixedRedCircles();
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = "Time: " + timeLeft + "s";
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function endGame() {
  if (score < 4) {
    alert(
      "⚠️ Looks like you might be distracted or tired. For accurate results, try again later."
    );
    window.location.href = "/reschedule?reason=Failed attention warm-up";
  } else {
    alert("✅ Great! You’re ready to continue.");
    fetch("/attention_warmup", {
      method: "POST",
    }).then(() => {
      window.location.href = "/";
    });
  }
}
// start immediately
startGame();
