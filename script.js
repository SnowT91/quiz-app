let questions = [];

async function fetchQuestions() {
    const loading = document.getElementById("loading");

    try {
        loading.classList.remove("hidden");

        const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");

        if (!response.ok) {
            throw new Error("Failed to fetch questions");
        }
        const data = await response.json();

        questions = data.results.map(q => {
            const answers = [
                ...q.incorrect_answers.map(a => ({text: a, correct: false})),
                {text: q.correct_answer, correct: true}
            ];
                
            return {
                question: decodeHTML(q.question),
                answers: shuffleArray(answers)
            };
        });
    
} catch (error) {
        alert("Error fetching questions. Please try again.");
        console.error(error);
    } finally {
        loading.classList.add("hidden");
        startBtn.disabled = false;
    }
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const startBtn = document.getElementById("start-btn");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const questionCounter = document.getElementById("question-counter");
const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");
const resultContainer = document.getElementById("result-container");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const resultMessageElement = document.getElementById("result-message");
const restartBtn = document.getElementById("restart-btn");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timerLeft = 10;
let filteredQuestions = [];

function getResultMessage() {
    const percent = (score / filteredQuestions.length) * 100;

    if (percent === 100) return "Perfect! 🚀";
    if (percent >= 70) return "Great job! 👍";
    if (percent >= 50) return "Not bad 🙂";
    return "Keep practicing 💪";
}

function getBestScore() {
    return localStorage.getItem("bestScore") || 0;
}

function saveBestScore(newScore) {
    const best = getBestScore();

    if (newScore > best) {
        localStorage.setItem("bestScore", newScore);
        return newScore;
    }

    return best;
}

function saveHistory(score) {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    history.push({
        score: score,
        total: filteredQuestions.length,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem("quizHistory", JSON.stringify(history));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];

    const historyContainer = document.getElementById("history");

    if (history.length === 0) {
        historyContainer.textContent = "No attempts yet.";
        return;
    }

    historyContainer.innerHTML = history
        .slice(-5)
        .reverse()
        .map(item => `Score: ${item.score}/${item.total} (${item.date})`)
        .join("<br>");
}

function filterQuestions() {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;

    filteredQuestions = questions.filter(q => {
        return (category === "all" || q.category === category) &&
                (difficulty === "all" || q.difficulty === difficulty);
    });

    if (filteredQuestions.length === 0) {
        filteredQuestions = questions;
    }
}

async function startQuiz() {
    startBtn.disabled = true;

    startScreen.classList.add("hidden");

    await fetchQuestions();

    filteredQuestions = shuffleArray(questions);

    currentQuestionIndex = 0;
    score = 0;

    progressBar.style.width = "0%";
    
    resultContainer.classList.add("hidden");
    questionContainer.classList.remove("hidden");
    
    quizScreen.classList.remove("hidden");

    nextBtn.classList.add("hidden");

    showQuestion();
}

function showQuestion() {
    resetState();
    updateProgressBar();
    updateQuestionCounter();

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    currentQuestion.answers.forEach((answer) => {
        const button = document.createElement("button");
        button.textContent = answer.text;

        if(answer.correct) {
            button.dataset.correct = "true";
        }

        button.addEventListener("click", selectAnswer);
        answerButtons.appendChild(button);
    });

    startTimer();
}

function resetState() {
    clearInterval(timer);
    timerLeft = 10;
    timerElement.textContent = timerLeft;
    nextBtn.classList.add("hidden");

    while(answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function startTimer() {
    timer = setInterval(() => {
        timerLeft--;
        timerElement.textContent = timerLeft;

        if (timerLeft <=0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    Array.from(answerButtons.children).forEach((button) => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    nextBtn.classList.remove("hidden");
}

function selectAnswer(e) {
    clearInterval(timer);

    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";

    if (correct) {
        selectedButton.classList.add("correct");
        score++;
    } else {
        selectedButton.classList.add("wrong");
    }

    Array.from(answerButtons.children).forEach((button) => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    nextBtn.classList.remove("hidden");
}

function goToNextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < filteredQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function updateProgressBar() {
    if (!filteredQuestions.length) return;

    const progress = ((currentQuestionIndex +1) / filteredQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateQuestionCounter() {
    if (!filteredQuestions.length) return;

    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${filteredQuestions.length}`;
}

function showResult() {
    quizScreen.classList.add("hidden");
    resultContainer.classList.remove("hidden");

    progressBar.style.width = "100%";

    scoreElement.textContent = `You scored ${score} out of ${filteredQuestions.length}`;

    saveHistory(score);
    renderHistory();

    const best =saveBestScore(score);
    bestScoreElement.textContent = `Best score: ${best}`;
    resultMessageElement.textContent = getResultMessage();
}

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", goToNextQuestion);
restartBtn.addEventListener("click", startQuiz);
