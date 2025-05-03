import React, { useEffect, useRef, useState } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';

const SpellingGame: React.FC<GameProps> = ({ data, onComplete }) => {
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

    // Reference to the input field for auto focus
    const inputRef = useRef<HTMLInputElement>(null);

    // Get the current word in uppercase
    const currentWord = words[index]?.word?.toUpperCase() ?? '';

    // Auto-focus the input on each new word
    useEffect(() => {
        inputRef.current?.focus();
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
                    <p className="lead">Spell the word:</p>
                    <h3>{currentWord}</h3>

                    {/* Input field for spelling */}
                    <input
                        ref={inputRef}
                        type="text"
                        className="form-control my-3"
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
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
