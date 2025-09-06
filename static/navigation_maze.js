let gridSize = 5;
let path = [];
let userPath = [];
let currentPos = {x: 0, y: 0};

function generatePath(length = 5) {
  let moves = ["up", "down", "left", "right"];
  let path = [];
  let pos = {x: 0, y: 0};
  for (let i = 0; i < length; i++) {
    let validMoves = moves.filter(move => {
      if (move === "up" && pos.y > 0) return true;
      if (move === "down" && pos.y < gridSize - 1) return true;
      if (move === "left" && pos.x > 0) return true;
      if (move === "right" && pos.x < gridSize - 1) return true;
      return false;
    });
    let move = validMoves[Math.floor(Math.random() * validMoves.length)];
    if (move === "up") pos.y--;
    if (move === "down") pos.y++;
    if (move === "left") pos.x--;
    if (move === "right") pos.x++;
    path.push(move);
  }
  return path;
}

function drawGrid() {
  let grid = document.getElementById("maze-grid");
  grid.innerHTML = "";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    let cell = document.createElement("div");
    cell.className = "maze-cell";
    grid.appendChild(cell);
  }
}

function showPath() {
  let cells = document.querySelectorAll(".maze-cell");
  let pos = {x: 0, y: 0}; // start at top-left

  let step = 0;
  let interval = setInterval(() => {
    if (step >= path.length) {
      clearInterval(interval);
      document.getElementById("status").innerText = "Now repeat the path!";
      return;
    }

    let idx = pos.y * gridSize + pos.x;
    cells[idx].style.backgroundColor = "lightgreen";

    switch (path[step]) {
      case "up": pos.y = Math.max(0, pos.y - 1); break;
      case "down": pos.y = Math.min(gridSize - 1, pos.y + 1); break;
      case "left": pos.x = Math.max(0, pos.x - 1); break;
      case "right": pos.x = Math.min(gridSize - 1, pos.x + 1); break;
    }
    step++;
  }, 800);

  setTimeout(() => {
    clearPathHighlight();
    // Enable user input here
  }, 1000 * path.length); // or whatever delay you use for showing path
}

function move(direction) {
  // ...existing movement logic...
  userPath.push({x: currentPos.x, y: currentPos.y});
  checkPath();
}

function checkPath() {
  let correctSteps = 0;
  let wrong = false;
  for (let i = 0; i < userPath.length; i++) {
    if (i >= path.length) break;
    if (userPath[i].x === path[i].x && userPath[i].y === path[i].y) {
      correctSteps++;
    } else {
      wrong = true;
      break;
    }
  }
  if (wrong) {
    document.getElementById("status").textContent = `❌ Wrong Path. Try again! Score: ${correctSteps}`;
    // Optionally reset userPath here
  } else if (userPath.length === path.length) {
    document.getElementById("status").textContent = `✅ Success! Score: ${correctSteps}`;
    // Optionally send score to server here
  }
}

function clearPathHighlight() {
  document.querySelectorAll(".maze-cell.path").forEach(cell => {
    cell.classList.remove("path");
  });
}

document.getElementById("start-btn").addEventListener("click", () => {
  path = generatePath(5);
  userPath = [];
  drawGrid();
  showPath();
});
