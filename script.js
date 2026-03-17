const question = [
    {
        question: "What is the capital of France?"
        answers: [
            { text: "Paris", correct: true },
            { text: "London", correct: false },
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false }
        ]
    },
    {
        question: "Which language runs in web browaer?"
        answers: [
            { text: "Java", correct: false },
            { text: "C", correct: false },
            { text: "Python", correct: false },
            { text: "JavaScript", correct: true }
        ]
    },
    {
      question: "Who wrote 'Harry Potter'?"
        answers: [
            { text: "J.K. Rowling", correct: true },
            { text: "J.R.R. Tolkien", correct: false },
            { text: "Mark Twain", correct: false },
            { text: "Ernest Hemingway", correct: false }  
        ]
    }
];

const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const resultContainer = document.getElementById("result-container");
const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultContainer.classicList.add("hidden");
    questionContainer.classicList.remove("hidden");
    showQuestion();
}

function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer.text
        button.classicList.add("btn");
        if(answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
        answerButtons.appendChild(button);
    });
}

function resetState() {
    while(answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(e) {
    const selectButton = e.target;
    const correct = selectButton.dataset.correct === "true";

    if(correct) {
        selectButton.classicList.add("correct");
        score++;
    } else {
        selectedButton.classicList.add("wrong");
    }

    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    setTimeout(() => {
        currentQuestionIndex++;
        if(currentQuestionIndex < questions.length) {
            showQuestion();
        }   else {
            showResult();
        }
    }, 1000);
}

function showResult() {
    questionContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    scoreElement.textContent = 'You scored ${score} out of ${questions.length}';
}

restartBtn.addEventListener("click", startQuiz);

startQuiz();
