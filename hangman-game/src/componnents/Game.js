import React, { useState, useEffect, useRef } from 'react';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import '../styles/Game.css'; // Import the CSS with animations

// Word lists for different difficulty levels
const easyWords = ['cat', 'dog', 'bat'];
const mediumWords = ['apple', 'banana', 'grape'];
const hardWords = ['javascript', 'hangman', 'programming'];

// Helper function to select a random word from the list based on difficulty
const randomWord = (difficulty) => {
  const wordList = {
    easy: easyWords,
    medium: mediumWords,
    hard: hardWords,
  };
  const words = wordList[difficulty];
  return words[Math.floor(Math.random() * words.length)];
};

function Game() {
    // State to store the current word to guess
    const [word, setWord] = useState(randomWord('easy')); 
    // State to track which letters have been guessed
    const [guessedLetters, setGuessedLetters] = useState([]);
    // Track the number of incorrect guesses (michelle: mistakes)
    const [incorrectGuesses, setIncorrectGuesses] = useState(0);
    // Track the score
    const [score, setScore] = useState(0);
    // Set maximum allowed mistakes as a constant
    const maxMistakes = 6;
    // State to control the visibility of the answer
    const [reveal, setReveal] = useState(false);
    // State to store the selected difficulty level
    const [difficulty, setDifficulty] = useState('easy');
    // State for timer countdown
    const [timeLeft, setTimeLeft] = useState(60); 
    // State to track whether the timer is running
    const [timerActive, setTimerActive] = useState(true);
    // Track the number of incorrect guesses for hint logic
    const [wrongGuessStreak, setWrongGuessStreak] = useState(0);
    // Track if the hint has been used
    const [hintUsed, setHintUsed] = useState(false);

    const canvasRef = useRef(null); // Canvas reference to draw the hangman

    const audioCorrect = new Audio('correct-sound.mp3'); // Replace with actual sound path
    const audioIncorrect = new Audio('incorrect-sound.mp3'); // Replace with actual sound path


    // Effect to reset the game when the difficulty changes
    useEffect(() => {
        setWord(randomWord(difficulty)); // Choose a new word based on difficulty
        setGuessedLetters([]); // Reset guessed letters
        setIncorrectGuesses(0); // Reset mistakes count
        setScore(0); // Reset score
        setReveal(false); // Hide the reveal at the start
        setTimeLeft(60); // Reset timer to 60 seconds
        setWrongGuessStreak(0); // Reset wrong guess streak
        setTimerActive(true); // Start the timer

        setHintUsed(false); // Reset hint usage
        drawGallows()
    }, [difficulty]);

    // Timer effect: Count down from 60 seconds
    useEffect(() => {
        let timer;
        if (timerActive && timeLeft > 0 && wrongGuessStreak < maxMistakes) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 || wrongGuessStreak >= maxMistakes) {
            setTimerActive(false); // Stop the timer
        }
        return () => clearInterval(timer); // Cleanup interval on component unmount or when the timer stops
    }, [timeLeft, timerActive, wrongGuessStreak]);

    // Function to clear the canvas
    const clearCanvas = () => {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // Function to draw the gallows (fixed part)
    const drawGallows = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 10; 

        // Draw the gallows frame (this will be visible at all times)
        ctx.beginPath();
        ctx.moveTo(175, 225);
        ctx.lineTo(5, 225);
        ctx.moveTo(40, 225);
        ctx.lineTo(25, 5);
        ctx.lineTo(100, 5);
        ctx.lineTo(100, 25);
        ctx.stroke();
    };


    // Function to draw the hangman figure
    const drawHangman = (part) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.strokeStyle = '#444';
        context.lineWidth = 5;
        
        switch (part) {


            case 'head':
                context.beginPath();
                context.arc(100, 50, 25, 0, Math.PI*2, true);
                context.closePath();
                context.stroke();
                break;
            
            case 'body':
                context.beginPath();
                context.moveTo(100, 75);
                context.lineTo(100, 140);
                context.stroke();
                break;

            case 'rightHarm':
                context.beginPath();
                context.moveTo(100, 85);
                context.lineTo(60, 100);
                context.stroke();
                break;

            case 'leftHarm':
                context.beginPath();
                context.moveTo(100, 85);
                context.lineTo(140, 100);
                context.stroke();
                break;

            case 'rightLeg':
                context.beginPath();
                context.moveTo(100, 140);
                context.lineTo(80, 190);
                context.stroke();
                context.beginPath();
                context.moveTo(82, 190);
                context.lineTo(70, 185);
                context.stroke();
                break;

            case 'leftLeg':
                context.beginPath();
                context.moveTo(100, 140);
                context.lineTo(125, 190);
                context.stroke();
                context.beginPath();
                context.moveTo(122, 190);
                context.lineTo(135, 185);
                context.stroke();
                break;
        }
    };

    // Function to handle when a letter is guessed
    const handleGuess = (letter) => {
        if (word.includes(letter)) {
            setScore((prev) => prev + 5); // Add 5 points for correct letter guess
            setWrongGuessStreak(0); // Reset wrong guess streak on correct guess

            audioCorrect.play(); // Play success sound

        } else {
            setIncorrectGuesses((prev) => prev + 1); // Increase incorrect guesses
            setWrongGuessStreak((prev) => prev + 1); // Increase streak on wrong guess

            audioIncorrect.play(); // Play failure sound

        }

        setGuessedLetters((prev) => [...prev, letter]); // Add guessed letter
    
        // Draw the hangman each time an incorrect guess is made
        const steps = [
            'head', 'body', 'rightHarm', 'leftHarm', 
            'rightLeg', 'leftLeg'
        ];

        // Only draw the part of the hangman corresponding to the current incorrect guess
        if (incorrectGuesses < 9) {
            drawHangman(steps[incorrectGuesses]);
        }
    };

    // Function to give a hint after 3 incorrect guesses
    const giveHint = () => {
        if (!hintUsed && incorrectGuesses >= 3) {
            const remainingLetters = word.split('').filter(letter => !guessedLetters.includes(letter));
            const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
            setGuessedLetters(prev => [...prev, randomLetter]);
            setHintUsed(true);
        }
    };

    // Function to check if the word has been completely guessed
    const checkIfWordGuessed = () => {
        return word.split('').every((letter) => guessedLetters.includes(letter));
    };

    // Function to move to the next word
    const moveToNextWord = () => {
        setWord(randomWord(difficulty)); // Pick a new word based on selected difficulty
        setGuessedLetters([]); // Reset guessed letters for the new word
        setIncorrectGuesses(0); // Reset mistakes for the new word
        setReveal(false); // Hide the reveal for the new word
    };

    // Function to reveal the answer
    const revealAnswer = () => {
        setReveal(true);  // Set reveal to true to show the word
        setGuessedLetters(word.split(''));  // Reveal the whole word
    };

    // Function to restart the game
    const restartGame = () => {
        setWord(randomWord(difficulty)); // Pick a new word based on selected difficulty
        setGuessedLetters([]);
        setIncorrectGuesses(0);
        setScore(0);
        setReveal(false);
        setTimeLeft(60); // Reset timer
        setTimerActive(true); // Start the timer again
        setWrongGuessStreak(0); // Reset wrong guess streak
        setHintUsed(false); // Reset hint usage
        clearCanvas(); // Clear the canvas when restarting the game
        drawGallows(); // Redraw the gallows at the start of a new game
    };

    // Check if the game is over (too many mistakes or time ran out)
    const isGameOver = wrongGuessStreak >= maxMistakes || timeLeft === 0;
    // Check if the game is won (all letters guessed)
    const isGameWon = checkIfWordGuessed();

    return (
        <div>
            <h1>Hangman Game</h1>

            {/* Difficulty Level Selection */}
            <label>
                Difficulty: 
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </label>

            {/* Timer and Score */}
            <div>
                <p>Time Left: <span className="val">{timeLeft}</span> seconds</p>
                <p>Score: <span className="score-val">{score}</span></p>
            </div>

            {/* Canvas for drawing the hangman */}
            <canvas ref={canvasRef} width={200} height={300} style={{ border: '2px solid #000', marginTop: '20px' }}></canvas>

            {/* Word Display Component with Animation */}
            <WordDisplay word={word} guessedLetters={guessedLetters} reveal={reveal} />

            {/* Keyboard Component */}
            <Keyboard onGuess={handleGuess} guessedLetters={guessedLetters} disabled={reveal || isGameOver} />

            {/* Hint and Action Buttons */}
            <button 
                onClick={giveHint} 
                className="hint" 
                disabled={hintUsed || incorrectGuesses < 3 || isGameOver || isGameWon}
            >
                Get a Hint
            </button>

            <button 
                onClick={revealAnswer} 
                className="action"
                disabled={reveal || isGameWon}
            >
                Reveal Answer
            </button>

            <button 
                onClick={moveToNextWord} 
                className="next-word"
                disabled={isGameOver}
            >
                Next Word
            </button>

            <button 
                onClick={restartGame} 
                className="restart"
            >
                Restart Game
            </button>

        </div>
    );
}

export default Game;
