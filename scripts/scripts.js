// Variables
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');
let myQuestions = [];
let currentSlide = 0;
const selectCategory = document.getElementById('categories');
const startGameBtn = document.querySelector('.btn-start');
const gameScreen = document.querySelector('.game');
const startingScreen = document.querySelector('.starting');
const endingScreen = document.querySelector('.end-screen');
const startAgain = document.getElementById('start-again');
const latestScore = document.querySelector('.last-played');
const timeEl = document.getElementById('time');

// Init time
let time = 10;

// Pagination
const nextButton = document.getElementById("next");

// Start counting down
let timeInterval = 0;

window.addEventListener('DOMContentLoaded', (event) => {
    latestScore.innerHTML = window.sessionStorage.getItem('userScore') ? 'Your latest score is: ' + window.sessionStorage.getItem('userScore') : '';
});


// Functions
function buildQuiz() {
    // variable to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach(
        (currentQuestion, questionNumber) => {

            // variable to store the list of possible answers
            const answers = [];
            // ...add an HTML radio button
            answers.push(
                ` <form>
                <label class="input-container">True
                    <input type="radio" name="question${questionNumber}" value="True">
                    <span class="checkmark"></span>
                </label>
                <label class="input-container">False
                    <input type="radio" name="question${questionNumber}" value="False">
                    <span class="checkmark"></span>
                </label>
            </form>`
            );

            // add this question and its answers to the output
            output.push(
                `<div class="slide">
              <div class="question"> ${currentQuestion.question} </div>
              <div class="answers"> ${answers.join("")} </div>
            </div>`
            );

        }
    );

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join('');
}

// Update time
function updateTime() {
    time--;
    timeEl.innerHTML = time + 's';

    if (time === 0) {
        time = 10;
        // next slide
        showNextSlide();
        const slides = document.querySelectorAll(".slide");
        // means last slide
        if (currentSlide === slides.length - 1) {
            clearInterval(timeInterval);
            showEndingScreen();
        }
    }
}

async function fetchQuestions(category) {
    res = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=medium&type=boolean`);
    const data = await res.json();
    const results = data.results.map(results => { return { question: results.question, correctAnswer: results.correct_answer, incorectQuestions: results.incorrect_answers } });
    return results;
}

function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll('.answers');

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {

        // find selected answer
        const answerContainer = answerContainers[questionNumber];
        const selector = `input[name=question${questionNumber}]:checked`;
        const userAnswer = (answerContainer.querySelector(selector) || {}).value;

        // if answer is correct
        if (userAnswer === currentQuestion.correctAnswer) {
            // add to the number of correct answers
            numCorrect++;

            // color the answers green
            answerContainers[questionNumber].style.color = 'lightgreen';
        }
        // if answer is wrong or blank
        else {
            // color the answers red
            answerContainers[questionNumber].style.color = 'red';
        }
    });

    // show number of correct answers out of total
    const finalScore = `${numCorrect} out of ${myQuestions.length}`;
    showEndingScreen();
    resultsContainer.innerHTML = finalScore;
    window.sessionStorage.setItem('userScore', finalScore);
}

function showEndingScreen() {
    if (gameScreen.classList.contains('play')) {
        gameScreen.classList.remove('play');
    }
    endingScreen.classList.add('show');
}

function showSlide(n) {
    const slides = document.querySelectorAll(".slide");
    if (slides.length == 0) {
        return;
    }
    slides[currentSlide].classList.remove('active-slide');
    slides[n].classList.add('active-slide');
    currentSlide = n;
    if (currentSlide === slides.length - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'inline-block';
    }
    else {
        nextButton.style.display = 'inline-block';
        submitButton.style.display = 'none';
    }
}

function showNextSlide() {
    showSlide(currentSlide + 1);
    time = 10;
}

function showPreviousSlide() {
    showSlide(currentSlide - 1);
}

function startGame() {
    fetchQuestions(selectCategory.value).then(res => {
        console.log(res);
        myQuestions = res;
        startingScreen.style.display = 'none';
        gameScreen.classList.add('play');
        buildQuiz();
        showSlide(currentSlide);
        timeInterval = setInterval(updateTime, 1000);
    });
}

function startNewGame() {
    if (endingScreen.classList.contains('show')) {
        endingScreen.classList.remove('show');
        startingScreen.style.display = 'flex';
        latestScore.innerHTML = 'Your latest score is: ' + window.sessionStorage.getItem('userScore');
    }
}

// Event listeners
submitButton.addEventListener('click', showResults);
nextButton.addEventListener("click", showNextSlide);
startGameBtn.addEventListener('click', startGame);
startAgain.addEventListener('click', startNewGame);
