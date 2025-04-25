const quizContainer = document.getElementById("quiz-content");
const submitBtn = document.getElementById("submit-btn");
const retryBtn = document.getElementById("retry-btn");
const resultDiv = document.getElementById("result");

let questions = [];

// Fetch questions from the JSON file
fetch("parsed_questions.json")
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    renderQuiz();
  })
  .catch((error) => console.error("Error loading questions:", error));

// Render the quiz
function renderQuiz() {
  quizContainer.innerHTML = "";
  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("mb-4");

    // Render question text
    const questionText = document.createElement("p");
    questionText.classList.add("font-bold");
    questionText.textContent = `${index + 1}. ${question.question}`;
    questionDiv.appendChild(questionText);

    // Render options
    question.options.forEach((option, optionIndex) => {
      const optionDiv = document.createElement("div");
      optionDiv.classList.add("flex", "items-center", "mb-2");

      const input = document.createElement("input");
      input.type = question.type === "multiple" ? "radio" : "checkbox";
      input.name = `question-${index}`;
      input.value = optionIndex;
      input.classList.add("mr-2");

      const label = document.createElement("label");
      label.textContent = option.text;

      optionDiv.appendChild(input);
      optionDiv.appendChild(label);
      questionDiv.appendChild(optionDiv);
    });

    quizContainer.appendChild(questionDiv);
  });
}

// Calculate the score
function calculateScore() {
  let score = 0;

  questions.forEach((question, index) => {
    const selectedOptions = Array.from(
      document.querySelectorAll(`input[name="question-${index}"]:checked`)
    ).map((input) => parseInt(input.value));

    if (question.type === "multiple") {
      // Multiple choice: 1 point for the correct answer
      const correctOption = question.options.findIndex((option) => option.correct);
      if (selectedOptions.length === 1 && selectedOptions[0] === correctOption) {
        score += 1;
      }
    } else if (question.type === "true_false") {
      // True/False: Partial scoring
      let correctCount = 0;
      selectedOptions.forEach((optionIndex) => {
        if (question.options[optionIndex]?.correct) {
          correctCount++;
        }
      });
      if (correctCount === 4) score += 1;
      else if (correctCount === 3) score += 0.5;
      else if (correctCount === 2) score += 0.25;
      else if (correctCount === 1) score += 0.1;
    }
  });

  return score.toFixed(2); // Return score rounded to 2 decimal places
}

// Handle submit button click
submitBtn.addEventListener("click", () => {
  const score = calculateScore();
  resultDiv.textContent = `Your score: ${score}`;
  resultDiv.classList.remove("hidden");
  retryBtn.classList.remove("hidden");
  submitBtn.classList.add("hidden");
});

// Handle retry button click
retryBtn.addEventListener("click", () => {
  renderQuiz();
  resultDiv.classList.add("hidden");
  retryBtn.classList.add("hidden");
  submitBtn.classList.remove("hidden");
});