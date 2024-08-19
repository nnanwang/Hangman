import React, { useState, useEffect } from 'react';


const words = ['apple', ' banana', 'cherry', 'watermelon', 'kiwi'];

const randomWord = () => words[Math.floor(Math.random() * words.length)];

function Game() {
    const [word, setWord] = useState(randomWord());
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [maxMistakes, setMaxMistakes] = useState(6);
    const [reveal, setReveal] = useState(faalse);

    useEffect(() => {
        setWord(randomWord());
        setGuessedLetters([]);
        setMistakes(0);
        setReveal(false);
    }, []);

}