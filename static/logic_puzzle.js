let score = 0;

// Example puzzles (each has 1 "odd one out")
const puzzles = [
  { shapes: ["▲", "▲", "▲", "■"], odd: "■" },
  { shapes: ["○", "○", "●", "○"], odd: "●" },
  { shapes: ["⬛", "⬛", "⬜", "⬛"], odd: "⬜" },
  { shapes: ["◆", "◆", "◇", "◆"], odd: "◇" },
  { shapes: ["⬤", "⬤", "⬤", "★"], odd: "★" }
];

let currentPuzzle = null;

function loadPuzzle() {
  // pick random puzzle
  currentPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  const box = document.getElementById("puzzle-box");
  box.innerHTML = "";

  currentPuzzle.shapes.forEach(shape => {
    const btn = document.createElement("button");
    btn.className = "shape-btn";
    btn.innerText = shape;
    btn.onclick = () => checkAnswer(shape);
    box.appendChild(btn);
  });

  document.getElementById("status").innerText = "";
}

function checkAnswer(choice) {
  if (choice === currentPuzzle.odd) {
    score++;
    document.getElementById("status").innerText = "✅ Correct!";
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "logic_puzzle", score: 1})
    });
  } else {
    document.getElementById("status").innerText = "❌ Wrong!";
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "logic_puzzle", score: 0})
    });
  }

  document.getElementById("score").innerText = score;
  setTimeout(loadPuzzle, 1000); // load new puzzle after 1 sec
}

window.onload = loadPuzzle;
