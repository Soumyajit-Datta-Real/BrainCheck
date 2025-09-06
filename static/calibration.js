let reactionStart = 0;
let reactionTime = 0;
let memorySequence = "";
let memoryCorrect = 0;

// Reaction speed test
const dot = document.getElementById("dot");
const reactionBtn = document.getElementById("reactionBtn");
const reactionResult = document.getElementById("reactionResult");
const memoryTest = document.getElementById("memoryTest");

reactionBtn.addEventListener("click", () => {
  reactionBtn.disabled = true;
  reactionResult.textContent = "Wait for green...";
  dot.style.background = "red";

  setTimeout(() => {
    dot.style.background = "green";
    reactionStart = Date.now();
    document.body.addEventListener("keydown", measureReaction);
    dot.addEventListener("click", measureReaction);
  }, Math.random() * 3000 + 1000); // random 1–4s
});

function measureReaction() {
  reactionTime = Date.now() - reactionStart;
  reactionResult.textContent = `Your reaction time: ${reactionTime} ms`;
  document.body.removeEventListener("keydown", measureReaction);
  dot.removeEventListener("click", measureReaction);
  setTimeout(startMemoryTest, 1500);
}

// Memory test
function startMemoryTest() {
  memoryTest.style.display = "block";
  memorySequence = "";
  for (let i = 0; i < 3; i++) {
    memorySequence += Math.floor(Math.random() * 10).toString();
  }
  document.getElementById("digits").textContent = memorySequence;

  setTimeout(() => {
    document.getElementById("digits").textContent = "";
  }, 2000);
}

document.getElementById("memorySubmit").addEventListener("click", () => {
  const userInput = document.getElementById("memoryInput").value.trim();
  memoryCorrect = 0;
  for (let i = 0; i < memorySequence.length; i++) {
    if (userInput[i] === memorySequence[i]) {
      memoryCorrect++;
    }
  }
  document.getElementById("memoryResult").textContent = `You got ${memoryCorrect}/3 correct.`;

  // submit to backend
  document.getElementById("reactionTimeField").value = reactionTime;
  document.getElementById("memoryCorrectField").value = memoryCorrect;
  document.getElementById("calibrationForm").submit();
});
