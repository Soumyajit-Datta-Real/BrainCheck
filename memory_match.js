// memory_match.js
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const boardEl = document.getElementById('board');
  const timerEl = document.getElementById('timer');
  const movesEl = document.getElementById('moves');
  const matchesEl = document.getElementById('matches');
  const scoreEl = document.getElementById('score');
  const gridSelect = document.getElementById('gridSize');
  const chartCanvas = document.getElementById('scoreChart');
  const historyBody = document.querySelector('#historyTable tbody');

  let gridSize = 4;
  let symbols = [];
  let firstCard = null;
  let secondCard = null;
  let lock = false;
  let moves = 0;
  let matches = 0;
  let totalPairs = 8;
  let timer = 0;
  let timerInterval = null;
  let score = 0;

  const emojiPool = ['🍎','🍇','🍒','🍋','🍉','🍊','🍓','🍌','🍍','🥝','🥥','🍑','🍐','🥭','🍈','🍅','🥕','🌽','🍄','🥦','🥔','🌶️','🧀','🍩','🍪','🍫','🍰','🍯','🥨','🥐','🍕','🍔','🍟','🌭','🥪','🥗'];

  function pickSymbols(pairs) {
    const pool = [...emojiPool];
    const selected = [];
    for (let i = 0; i < pairs; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]);
    }
    return selected;
  }

  function createBoard() {
    boardEl.innerHTML = '';
    const pairs = (gridSize * gridSize) / 2;
    totalPairs = pairs;
    const chosen = pickSymbols(pairs);
    symbols = [...chosen, ...chosen];
    // shuffle
    for (let i = symbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
    }
    boardEl.className = `board grid-${gridSize}`;
    symbols.forEach((sym, idx) => {
      const c = document.createElement('div');
      c.className = 'card';
      c.dataset.symbol = sym;
      c.dataset.index = idx;
      c.innerHTML = `
        <div class="face back">?</div>
        <div class="face front">${sym}</div>
      `;
      c.addEventListener('click', () => onCardClick(c));
      boardEl.appendChild(c);
    });
  }

  function onCardClick(card) {
    if (lock) return;
    if (card.classList.contains('flipped')) return;
    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }
    if (!secondCard) {
      secondCard = card;
      moves++;
      movesEl.textContent = moves;
      checkMatch();
    }
  }

  function checkMatch() {
    const a = firstCard;
    const b = secondCard;
    if (!a || !b) return;
    lock = true;
    if (a.dataset.symbol === b.dataset.symbol) {
      matches++;
      matchesEl.textContent = matches;
      firstCard = null;
      secondCard = null;
      lock = false;
      computeScore();
      if (matches === totalPairs) {
        endGame();
      }
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        firstCard = null;
        secondCard = null;
        lock = false;
        computeScore();
      }, 800);
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timerEl.textContent = timer;
    timerInterval = setInterval(() => {
      timer++;
      timerEl.textContent = timer;
      computeScore();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function computeScore() {
    const base = 2000;
    const penaltyTime = timer * 6;
    const penaltyMoves = moves * 12;
    const rewardMatches = matches * 80;
    score = Math.max(0, Math.round(base - penaltyTime - penaltyMoves + rewardMatches));
    scoreEl.textContent = score;
  }

  function endGame() {
    stopTimer();
    computeScore();
    fetch('/submit', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        game: 'Memory Match',
        moves,
        time_seconds: timer,
        matches,
        grid_size: gridSize,
        score
      })
    }).then(() => {
      loadHistory();
      alert(`Game finished! Score: ${score}`);
    });
  }

  function resetStats() {
    moves = 0; matches = 0;
    firstCard = null; secondCard = null; lock = false;
    movesEl.textContent = moves;
    matchesEl.textContent = matches;
    score = 0; scoreEl.textContent = score;
    timerEl.textContent = 0;
  }

  startBtn.addEventListener('click', () => {
    gridSize = parseInt(gridSelect.value, 10);
    resetStats();
    createBoard();
    startTimer();
  });

  // History & chart
  let chart = null;
  async function loadHistory() {
    const res = await fetch('/history');
    const data = await res.json();
    const chron = data.slice().reverse();
    const labels = chron.map(d => d.datetime);
    const scores = chron.map(d => d.score);

    historyBody.innerHTML = '';
    data.forEach((d, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${d.datetime}</td><td>${d.grid_size}x${d.grid_size}</td><td>${d.time_seconds}</td><td>${d.moves}</td><td>${d.matches}</td><td>${d.score}</td>`;
      historyBody.appendChild(tr);
    });

    if (chart) chart.destroy();
    chart = new Chart(chartCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Memory Match Score',
          data: scores,
          fill: false,
          tension: 0.3,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // initial load
  createBoard();
  loadHistory();
  computeScore();
});
