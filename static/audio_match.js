const wordBank = [
  "apple", "banana", "orange", "grape", "pear", 
  "peach", "mango", "lemon", "melon", "berry"
];

let currentWord = "";
let score = 0;

function speakWord(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
}

function newRound() {
  // pick correct word
  currentWord = wordBank[Math.floor(Math.random() * wordBank.length)];

  // create 3 distractors
  let options = new Set([currentWord]);
  while (options.size < 4) {
    options.add(wordBank[Math.floor(Math.random() * wordBank.length)]);
  }
  let optionList = Array.from(options).sort(() => Math.random() - 0.5);

  // render buttons
  const optBox = document.getElementById("options");
  optBox.innerHTML = "";
  optionList.forEach(word => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = word;
    btn.onclick = () => checkAnswer(word);
    optBox.appendChild(btn);
  });

  document.getElementById("status").innerText = "";
}

function checkAnswer(selected) {
  if (selected === currentWord) {
    score++;
    document.getElementById("status").innerText = "✅ Correct!";
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "audio_match", score: 1})
    });
  } else {
    document.getElementById("status").innerText = `❌ Wrong! It was: ${currentWord}`;
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "audio_match", score: 0})
    });
  }
  document.getElementById("score").innerText = score;
}

document.getElementById("play-audio").addEventListener("click", () => {
  speakWord(currentWord);
});
document.getElementById("new-round").addEventListener("click", newRound);

// init first round
newRound();
