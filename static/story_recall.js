document.addEventListener("DOMContentLoaded", () => {
  const storySection = document.getElementById("storySection");
  const questionsSection = document.getElementById("questionsSection");
  const resultSection = document.getElementById("resultSection");
  const scoreOut = document.getElementById("scoreOut");
  const skipBtn = document.getElementById("skipToQuestions");
  const submitBtn = document.getElementById("submitQuiz");

  // Show story for 10s, then auto-switch
  const storyTimeout = setTimeout(showQuestions, 10000);

  skipBtn.addEventListener("click", () => {
    clearTimeout(storyTimeout);
    showQuestions();
  });

  function showQuestions() {
    storySection.classList.add("hidden");
    questionsSection.classList.remove("hidden");
    const firstRadio = questionsSection.querySelector('input[type="radio"]');
    if (firstRadio) firstRadio.focus();
  }

  submitBtn.addEventListener("click", () => {
    // Get correct answers from data attributes or server if needed
    // For demo, use answers from Flask context (not hardcoded)
    const radios = questionsSection.querySelectorAll('input[type="radio"]:checked');
    let score = 0;
    radios.forEach(radio => {
      if (radio.value === radio.getAttribute("data-answer")) score++;
    });

    // Save score
    fetch("/submit_score", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        game: "Story Recall",
        score
      })
    }).catch(() => {});

    questionsSection.classList.add("hidden");
    resultSection.classList.remove("hidden");
    scoreOut.textContent = score.toString();
  });
});
