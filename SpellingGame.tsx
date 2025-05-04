import React, { useEffect, useRef, useState } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';

/**
 * jsdoc от друга ильи
 * 
 * Props:
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.data - The game data containing a list of words and their hints. Format: `{ word: string, hint: string }[]`.
 * @param {Object[]} [props.settings] - Optional settings object. Expected to include a `difficulty` key with values such as "easy", "medium", or "hard".
 * @param {function(GameResult): void} props.onComplete - Callback function triggered when the game finishes, returning a `GameResult` object.
*
* State:
* - Tracks user input, current word index, input count, and game results.
 * - Dynamically adjusts when to reveal the actual word based on difficulty and mistype count.
*
* Usage:
 * ```tsx
 * <SpellingGame
 *   data={{ word_list: [{ word: 'apple', hint: 'A fruit' }] }}
 *   settings={ difficulty: 'hard' }
 *   onComplete={(result) => spellingGameHandler(result)}
 * />
 * ```
*/
const SpellingGame: React.FC<GameProps> = ({ data, settings, onComplete }: GameProps) => {
    console.log("SpellingGame data:", data);

    // Extract the list of words from the game data (fallback to empty array)
    const initialWords = data?.word_list || [];
    const [queue, setQueue] = useState(initialWords);
    const attemptCounts = useRef<Record<string, number>>({}); // мапа: сколько раз пытались напечатать каждое слово

    // от ильи:
    // сделай реализацию где игра принимает настройки
    // настройка, отвечающая за эту самую сложность, которую ты получил бы из массива параметров settings
    const difficulty = settings?.difficulty as string ?? 'normal';

    // Store the user's current input
    const [input, setInput] = useState('');

    // Store result history per word: correct or wrong
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);

    const thresholds = {
        'easy': 5,
        'normal': 10,
        'hard': 20,
        'no-hints': Number.MAX_VALUE
    }

    const baseThreshold = thresholds[difficulty] as number ?? 15; // колво нажатий на клаве для показа слова

    // Get the current word in uppercase
    const currentWord: string = queue[0]?.word?.toUpperCase() ?? '';

    const mistypeCount = attemptCounts.current[currentWord] || 0; // сколько раз слово уже было напечатано в этой сессии (т.е. напечатано неверно)

    const inputsThreshold = baseThreshold - (mistypeCount * 2); // колво нажатий для показа слова с учетом ошибок (больше ошибок => быстрее показывается)

    // Track whether the game is completed
    const [completed, setCompleted] = useState(false);

    const [inputCount, setInputCount] = useState(0); // количество нажатий на клаве

    // Reference to the input field for auto focus
    const inputRef = useRef<HTMLInputElement>(null);

    // от ильи:
    // там я еще hint добавить думал
    const currentHint = queue[0]?.hint;

    // Auto-focus the input on each new word
    useEffect(() => {
        inputRef.current?.focus();
        setInputCount(0); // сбрасывать счётчик нажатий на каждом новом слове
    }, [queue]);

    // Handle word submission
    const handleSubmit = () => {
        if (!currentWord) return;

        // Check if input is correct
        const isCorrect = input === currentWord;

        // Update results with current word and correctness
        setResults(results.concat({ word: currentWord, correct: isCorrect }));

        attemptCounts.current[currentWord]++; // TODO а это разве не immutable???

        const nextQueue = queue.slice(1); // убрать 1й элемент в очереди
        if (!isCorrect)
            nextQueue.push(currentWord); // запихнуть в конец очереди если неправильно написано

        // Move to next word if available
        if (nextQueue.length >= 0) {
            setQueue(nextQueue);
            setInput('');
        } else {
            // Game is complete, calculate summary
            const correctWords = results.filter(r => r.correct).map(r => r.word);
            const failedWords = results.filter(r => !r.correct).map(r => r.word);

            const gameResult: GameResult = {
                successRate: (correctWords.length / initialWords.length) * 100,
                completedWords: correctWords,
                failedWords: failedWords,
                rawLog: results
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
                    {currentHint && (
                        <h5 className="mb-3">{currentHint}</h5>
                    )}

                    {/* Показать слово после inputsThreshold нажатий (фора - длина слова) */}
                    {inputCount >= (inputsThreshold + currentWord.length) && (
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
                        results.filter(r => r.correct).length / initialWords.length * 100
                    ).toFixed(0)}%</p>
                </div>
            )}
        </BaseGame>
    );
};

export default SpellingGame;
