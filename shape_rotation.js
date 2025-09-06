const canvas = document.getElementById("shapeCanvas");
const ctx = canvas.getContext("2d");

const rotateLeftBtn = document.getElementById("rotateLeft");
const rotateRightBtn = document.getElementById("rotateRight");
const submitBtn = document.getElementById("submitBtn");

const rotationEl = document.getElementById("current-rotation");
const scoreEl = document.getElementById("score");
const attemptsEl = document.getElementById("attempts");
const statusEl = document.getElementById("status");

let currentRotation = 0;
let targetRotation = 0;
let score = 0;
let attempts = 0;

// Draw a simple shape (triangle)
function drawShape(rotation) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  ctx.beginPath();
  ctx.moveTo(0, -60);
  ctx.lineTo(50, 50);
  ctx.lineTo(-50, 50);
  ctx.closePath();

  ctx.fillStyle = "#4CAF50";
  ctx.fill();
  ctx.restore();
}

function newRound() {
  // Reset rotation
  currentRotation = 0;
  // Pick random target (multiple of 90)
  targetRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];

  // Apply target to shape (so it's rotated when shown)
  drawShape(targetRotation);
  rotationEl.innerText = currentRotation;
  statusEl.innerText = "Rotate the shape back to 0°!";
}

function updateRotationDisplay() {
  rotationEl.innerText = currentRotation;
  drawShape((targetRotation + currentRotation) % 360);
}

rotateLeftBtn.addEventListener("click", () => {
  currentRotation = (currentRotation - 15 + 360) % 360;
  updateRotationDisplay();
});

rotateRightBtn.addEventListener("click", () => {
  currentRotation = (currentRotation + 15) % 360;
  updateRotationDisplay();
});

submitBtn.addEventListener("click", () => {
  attempts++;
  if (((targetRotation + currentRotation) % 360) === 0) {
    score++;
    statusEl.innerText = "✅ Correct!";
  } else {
    statusEl.innerText = "❌ Wrong!";
  }
  scoreEl.innerText = score;
  attemptsEl.innerText = attempts;

  // Save result to backend
  fetch("/save_score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      game: "shape_rotation",
      score: score,
      attempts: attempts
    })
  });

  setTimeout(newRound, 1200);
});

window.onload = () => {
  newRound();
};
