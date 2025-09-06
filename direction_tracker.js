let currentCue = "";
let score = 0;
let startTime = null;

function playCue() {
  currentCue = Math.random() > 0.5 ? "L" : "R";
  const utter = new SpeechSynthesisUtterance(currentCue);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);

  startTime = Date.now(); // start reaction timer
  document.getElementById("status").innerText = "Listening...";
}

function handleChoice(choice) {
  if (!currentCue) return; // no cue yet

  const reactionTime = Date.now() - startTime;
  document.getElementById("reaction").innerText = reactionTime;

  if (choice === currentCue) {
    score++;
    document.getElementById("status").innerText = `✅ Correct (${currentCue})`;
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "direction_tracker", score: 1})
    });
  } else {
    document.getElementById("status").innerText = `❌ Wrong! Heard ${currentCue}`;
    fetch("/save_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({game: "direction_tracker", score: 0})
    });
  }
  document.getElementById("score").innerText = score;
  currentCue = ""; // reset until next round
}

document.getElementById("play-cue").addEventListener("click", playCue);
document.getElementById("left-btn").addEventListener("click", () => handleChoice("L"));
document.getElementById("right-btn").addEventListener("click", () => handleChoice("R"));
