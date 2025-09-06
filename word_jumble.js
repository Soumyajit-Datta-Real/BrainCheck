const words = [
  "memory", "cognitive", "brain", "dyslexia", "neuron", 
  "attention", "focus", "logic", "reasoning", "learning"
];

let currentWord = "";

function shuffleWord(word) {
  let arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function newWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  let scrambled = shuffleWord(currentWord);
  while (scrambled === currentWord) {
    scrambled = shuffleWord(currentWord);
  }
  document.getElementById("jumble-word").innerText = scrambled;
  document.getElementById("status").innerText = "";
  document.getElementById("user-answer").value = "";
}

function checkAnswer() {
  const answer = document.getElementById("user-answer").value.toLowerCase();
  const status = document.getElementById("status");

  if (answer === currentWord) {
    status.innerText = "✅ Correct!";
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "word_jumble", score: 1})
    });
  } else {
    status.innerText = `❌ Wrong! The word was: ${currentWord}`;
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "word_jumble", score: 0})
    });
  }
}

document.getElementById("submit-btn").addEventListener("click", checkAnswer);
document.getElementById("new-word-btn").addEventListener("click", newWord);

// Load first word
newWord();
