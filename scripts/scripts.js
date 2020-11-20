// Variables
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');
let myQuestions = [];
let currentSlide = 0;
const selectCategory = document.getElementById('categories');
const startGame = document.querySelector('.btn-start');
const gameScreen = document.querySelector('.game');
const startingScreen = document.querySelector('.starting');
const endingScreen = document.querySelector('.end-screen');
const startAgain = document.getElementById('start-again');
const latestScore = document.querySelector('.last-played');

// Pagination
const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");

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
                    <input type="radio" name="question${questionNumber}" id="answer" value="True">
                    <span class="checkmark"></span>
                </label>
                <label class="input-container">False
                    <input type="radio" name="question${questionNumber}" id="answer" value="False">
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

async function fetchQuestions(category) {
    let res = '';
    if (category === 'any') {
        res = await fetch(`https://opentdb.com/api.php?amount=10`);
    } else {
        res = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=medium&type=boolean`);
    }

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
        console.log(userAnswer);

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
    if (gameScreen.classList.contains('play')) {
        gameScreen.classList.remove('play');
    }
    endingScreen.classList.add('show');
    resultsContainer.innerHTML = finalScore;
    window.sessionStorage.setItem('userScore', finalScore);
}

function showSlide(n) {
    const slides = document.querySelectorAll(".slide");

    if (slides.length == 0) {
        return;
    }
    slides[currentSlide].classList.remove('active-slide');
    slides[n].classList.add('active-slide');
    currentSlide = n;
    if (currentSlide === 0) {
        previousButton.style.display = 'none';
    }
    else {
        previousButton.style.display = 'inline-block';
    }
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
}

function showPreviousSlide() {
    showSlide(currentSlide - 1);
}

function startTheGame() {
    fetchQuestions(selectCategory.value).then(res => {
        console.log(res);
        myQuestions = res;
        startingScreen.style.display = 'none';
        gameScreen.classList.add('play');
        buildQuiz();
        showSlide(currentSlide);
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
previousButton.addEventListener("click", showPreviousSlide);
nextButton.addEventListener("click", showNextSlide);
startGame.addEventListener('click', startTheGame);
startAgain.addEventListener('click', startNewGame);
