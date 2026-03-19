const questions = [
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Paris", correct: true },
            { text: "London", correct: false },
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false }
        ]
    },
    {
        question: "Which language runs in web browser?",
        answers: [
            { text: "Java", correct: false },
            { text: "C", correct: false },
            { text: "Python", correct: false },
            { text: "JavaScript", correct: true }
        ]
    },
    {
        question: "Who wrote 'Harry Potter'?",
        answers: [
            { text: "J.K. Rowling", correct: true },
            { text: "J.R.R. Tolkien", correct: false },
            { text: "Mark Twain", correct: false },
            { text: "Ernest Hemingway", correct: false }  
        ]
    },
    {
        question: "What does CSS stand for?",
        answers: [
            { text: "Computer Style Sheets", correct: false },
            { text: "Cascading Style Sheets", correct: true },
            { text: "Creative Style Sheets", correct: false },
            { text: "Colorful Style Sheets", correct: false } 
        ]
    },
    {
        question: "Which company developed JavaScript?",
        answers: [
            { text: "Microsoft", correct: false },
            { text: "Sun Microsystems", correct: false },
            { text: "Netscape", correct: true },
            { text: "Oracle", correct: false } 
        ]
    }
];

const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const resultContainer = document.getElementById("result-container");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timerLeft = 10;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultContainer.classList.add("hidden");
    questionContainer.classList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    resetState();
    updateProgressBar();

    const currentQuestion = questions[currentQuestionIndex];
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

    setTimeout(() => {
        goToNextQuestion();
    }, 1000);
}

function selectAnswer(e) {
    clearInterval(timer);

    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";

    if(correct) {
        selectedButton.classList.add("correct");
        score++;
    } else {
        selectedButton.classList.add("wrong");
    }

    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    setTimeout(() => {
        goToNextQuestion();
    }, 1000);
}

function goToNextQuestion() {
    currentQuestionIndex++

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    }   else {
        showResult();
    }
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex +1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function showResult() {
    questionContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    progressBar.style.width = "100%";
    scoreElement.textContent = `You scored ${score} out of ${questions.length}`;
}

restartBtn.addEventListener("click", startQuiz);

startQuiz();
