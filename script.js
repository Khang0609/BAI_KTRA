const quizContainer = document.getElementById("quiz-content");
const retryBtn = document.getElementById("retry-btn");
const resultDiv = document.getElementById("result");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // To store user's answers for review

// Fetch questions from the JSON file
fetch("parsed_questions.json")
  .then((response) => response.json())
  .then((data) => {
    questions = shuffleArray(data); // Shuffle questions
    questions.forEach((q) => (q.options = shuffleArray(q.options))); // Shuffle options
    renderQuestion();
  })
  .catch((error) => console.error("Error loading questions:", error));

// Shuffle array utility function
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Render a single question
function renderQuestion() {
  quizContainer.innerHTML = "";
  const question = questions[currentQuestionIndex];
  const questionDiv = document.createElement("div");
  questionDiv.classList.add("mb-4");

  // Render question text
  const questionText = document.createElement("p");
  questionText.classList.add("font-bold");
  questionText.textContent = `${currentQuestionIndex + 1}. ${
    question.question
  }`;
  questionDiv.appendChild(questionText);

  // Render options
  question.options.forEach((option, optionIndex) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("flex", "items-center", "mb-2");

    const input = document.createElement("input");
    input.type = question.type === "multiple" ? "radio" : "checkbox";
    input.name = `question-${currentQuestionIndex}`;
    input.value = optionIndex;
    input.classList.add("mr-2");

    const label = document.createElement("label");
    label.textContent = option.text;

    optionDiv.appendChild(input);
    optionDiv.appendChild(label);
    questionDiv.appendChild(optionDiv);
  });

  quizContainer.appendChild(questionDiv);

  // Add check answer button
  const checkBtn = document.createElement("button");
  checkBtn.textContent = "Check Answer";
  checkBtn.classList.add(
    "mt-4",
    "bg-blue-500",
    "text-white",
    "px-4",
    "py-2",
    "rounded",
    "hover:bg-blue-700"
  );
  checkBtn.addEventListener("click", checkAnswer);
  quizContainer.appendChild(checkBtn);

  // Add skip button
  const skipBtn = document.createElement("button");
  skipBtn.textContent = "Skip";
  skipBtn.classList.add(
    "mt-4",
    "ml-2",
    "bg-gray-500",
    "text-white",
    "px-4",
    "py-2",
    "rounded",
    "hover:bg-gray-700"
  );
  skipBtn.addEventListener("click", skipQuestion);
  quizContainer.appendChild(skipBtn);
}

// Check the answer for the current question
function checkAnswer() {
  const question = questions[currentQuestionIndex];
  const selectedOptions = Array.from(
    document.querySelectorAll(
      `input[name="question-${currentQuestionIndex}"]:checked`
    )
  ).map((input) => parseInt(input.value));

  if (selectedOptions.length === 0) {
    alert("Please select an answer!");
    return;
  }

  // Evaluate the answer
  let correct = true;
  let correctCount = 0;
  selectedOptions.forEach((optionIndex) => {
    if (question.options[optionIndex]?.correct) {
      correctCount++;
    } else {
      correct = false;
    }
  });

  if (
    question.type === "true_false" &&
    correctCount < question.options.filter((o) => o.correct).length
  ) {
    correct = false;
  }

  // Store user's answer for review
  userAnswers.push({
    question: question.question,
    selected: selectedOptions,
    correct: question.options.map((o) => o.correct),
  });

  // Calculate score for the first attempt
  if (correct) {
    score +=
      question.type === "multiple"
        ? 1
        : correctCount / question.options.filter((o) => o.correct).length;
    alert("Correct!");
    nextQuestion();
  } else {
    alert("Incorrect! Try again or skip.");
  }
}

// Skip the current question
function skipQuestion() {
  // Store skipped question with no selected answers
  userAnswers.push({
    question: questions[currentQuestionIndex].question,
    selected: [],
    correct: questions[currentQuestionIndex].options.map((o) => o.correct),
  });
  nextQuestion();
}

// Move to the next question or show results
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

// Show the results and review
function showResults() {
  quizContainer.innerHTML =
    "<h2 class='text-2xl font-bold mb-4'>Quiz Completed!</h2>";
  const scoreText = document.createElement("p");
  scoreText.textContent = `Your final score: ${score.toFixed(2)}`;
  scoreText.classList.add("mb-4");
  quizContainer.appendChild(scoreText);

  userAnswers.forEach((answer, index) => {
    const reviewDiv = document.createElement("div");
    reviewDiv.classList.add("mb-4");

    const questionText = document.createElement("p");
    questionText.classList.add("font-bold");
    questionText.textContent = `${index + 1}. ${answer.question}`;
    reviewDiv.appendChild(questionText);

    answer.correct.forEach((isCorrect, optionIndex) => {
      const optionText = questions[index].options[optionIndex].text;
      const optionDiv = document.createElement("div");
      optionDiv.textContent = `${isCorrect ? "✔️" : "❌"} ${optionText}`;
      optionDiv.classList.add(isCorrect ? "text-green-500" : "text-red-500");
      reviewDiv.appendChild(optionDiv);
    });

    quizContainer.appendChild(reviewDiv);
  });

  retryBtn.classList.remove("hidden");
}

// Retry the quiz
retryBtn.addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  questions = shuffleArray(questions);
  questions.forEach((q) => (q.options = shuffleArray(q.options)));
  retryBtn.classList.add("hidden");
  renderQuestion();
});
