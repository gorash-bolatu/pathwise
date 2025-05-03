import React, { useEffect, useRef, useState } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';

// сделай реализацию где игра принимает настройки
const SpellingGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    console.log("SpellingGame data:", data);

    // Extract the list of words from the game data (fallback to empty array)
    const words = data?.word_list || [];

    // Track current word index
    const [index, setIndex] = useState(0);

    // Store the user's current input
    const [input, setInput] = useState('');

    // Store result history per word: correct or wrong
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);

    // Track whether the game is completed
    const [completed, setCompleted] = useState(false);
    
    const [inputCount, setInputCount] = useState(0); // Tracks input change count 

    // Reference to the input field for auto focus
    const inputRef = useRef<HTMLInputElement>(null);

    // Get the current word in uppercase
    const currentWord: string = words[index]?.word?.toUpperCase() ?? '';

    // там я еще hint добавить думал
    const currentHint = words[index]?.hint;

    // Auto-focus the input on each new word
    useEffect(() => {
        inputRef.current?.focus();
        setInputCount(0); // Reset input count on new word
    }, [index]);

    // Handle word submission
    const handleSubmit = () => {
        if (!currentWord) return;

        // Check if input is correct
        const isCorrect = input === currentWord;

        // Update results with current word and correctness
        const newResults = [...results, { word: currentWord, correct: isCorrect }];
        setResults(newResults);

        // Move to next word if available
        if (index + 1 < words.length) {
            setIndex(index + 1);
            setInput('');
        } else {
            // Game is complete, calculate summary
            const correctWords = newResults.filter(r => r.correct).map(r => r.word);
            const failedWords = newResults.filter(r => !r.correct).map(r => r.word);

            const gameResult: GameResult = {
                successRate: (correctWords.length / words.length) * 100,
                completedWords: correctWords,
                failedWords: failedWords,
                rawLog: newResults
            };

            setCompleted(true);
            onComplete(gameResult); // Notify parent of completion
        }
    };

    return (
        <BaseGame title="Spelling Game">
            {!completed ? (
                <>
                    <p className="lead">Definiton:</p>
                    <h5 className="mb-3">{currentHint}</h5>

                    {/* Reveal the word after 15 input changes */}
                    {inputCount >= 15 && (
                        <div className="alert alert-info">The word is: <strong>{currentWord}</strong></div>
                    )}

                    {/* Input field for spelling */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="form-control my-3"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value.toUpperCase());
                            setInputCount(prev => prev + 1);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        autoComplete="off"
                    />

                    {/* Button to submit the word */}
                    <button className="btn btn-primary" onClick={handleSubmit}>Check</button>
                </>
            ) : (
                // Summary after game ends
                <div className="alert alert-success mt-4">
                    <h5>🎉 Game Completed!</h5>
                    <p>Success Rate: {(
                        results.filter(r => r.correct).length / words.length * 100
                    ).toFixed(0)}%</p>
                </div>
            )}
        </BaseGame>
    );
};

export default SpellingGame;
