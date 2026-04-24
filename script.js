let questions = [];

async function fetchQuestions() {
    const loading = document.getElementById("loading");

    try {
        loading.classList.remove("hidden");
        errorContainer.classList.add("hidden"); // Прячем прошлые ошибки

        let url = "https://opentdb.com/api.php?amount=5&type=multiple";
        const difficulty = difficultySelect.value;
        const category = categorySelect.value;
        const categoryMap = { "general": 9, "computers": 18 };

        if (difficulty !== "all") url += `&difficulty=${difficulty}`;
        if (category !== "all") url += `&category=${categoryMap[category] || category}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to connect to the server.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("No questions found. Try different settings.");
        }

        questions = data.results.map(q => {
            const answers = [
                ...q.incorrect_answers.map(a => ({text: decodeHTML(a), correct: false})),
                {text: q.correct_answer, correct: true}
            ];
            return {
                question: decodeHTML(q.question),
                answers: shuffleArray(answers)
            };
        });

        return true; // Возвращаем true, если всё прошло успешно
    
    } catch (error) {
        console.error(error);
        //Если ошибка: прячем лоадер, показываем кастомный текст ошибки
        loading.classList.add("hidden");
        errorText.textContent = error.message || "An unexpected error occured.";
        errorContainer.classList.remove("hidden");    
        return false; // Возвращаем false, сигнализируя об ошибке
    }
}

function shuffleArray(array) {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function decodeHTML(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
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
const errorContainer = document.getElementById("error-container");
const errorText = document.getElementById("error-text");
const backBtn = document.getElementById("back-btn");

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

    const historyItems = history
        .slice(-5)
        .reverse()
        .map(item => `<li>Score: ${item.score}/${item.total} <span style="color: #999; font-size: 12px;">(${item.date})</span></li>`)
        .join("");
    historyContainer.innerHTML = `<ul style="list-style: none; padding: 0; margin: 0;">${historyItems}</ul>`;
}

async function startQuiz() {
    startBtn.disabled = true;
    restartBtn.disabled = true; // Защита от двойного клика при рестарте

    //1. Прячем стартовый экран и результаты
    startScreen.classList.add("hidden");
    resultContainer.classList.add("hidden");

    //2. Показываем экран викторины (чтобы был виден loading), но прячем сам контейнер с вопросом, зачищаем ошибки при рестарте
    quizScreen.classList.remove("hidden");
    questionContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");

    //. 3. Зачищаем стейт перед новым запросом, ждем загрузку вопросов
    questions = [];
    
    const isSuccess = await fetchQuestions();

    restartBtn.disabled = false;
    startBtn.disabled = false;

    //4. Если данные не загрузились (isSuccess === false), прерываем функцию. // (Пользователь уже видит errorContainer благодаря логике внутри fetchQuestions)
    if (!isSuccess) {
        return;
    }
    
    //5. Если все отлично, прячем лоадер и показываем вопросы
    document.getElementById("loading").classList.add("hidden");

    filteredQuestions = shuffleArray(questions);
    currentQuestionIndex = 0;
    score = 0;

    progressBar.style.width = "0%";
    
    //6. Показываем контейнер с вопросами и прячем кнопку Next
    questionContainer.classList.remove("hidden");
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
    revealAnswer();
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

    revealAnswer(); // Вызываем вместо дублирования цикла
}

function revealAnswer() {  
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
backBtn.addEventListener("click", () => {
    quizScreen.classList.add("hidden");
    errorContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
});
