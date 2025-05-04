import React, { useEffect, useRef, useState } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';


const SpellingGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    console.log("SpellingGame data:", data);
    console.log("SpellingGame settings:", settings);

    // Extract the list of words from the game data (fallback to empty array)
    const initialWords: { word: string; hint: string }[] = Array.isArray(data?.word_list) ? data.word_list : [];

    if (initialWords.length === 0) {
        return <div>No words provided for the game.</div>;
    }
    const [queue, setQueue] = useState(initialWords);
    const attemptCounts = useRef<Record<string, number>>({}); // мапа: сколько раз пытались напечатать каждое слово

    // от ильи:
    // сделай реализацию где игра принимает настройки
    // настройка, отвечающая за эту самую сложность, которую ты получил бы из массива параметров settings
    type Difficulty = 'easy' | 'normal' | 'hard' | 'no-hints';
    const difficulty: Difficulty = settings?.difficulty ?? 'normal';
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
    const currentWord: string = queue[0]?.word ?? '';

    const mistypeCount = attemptCounts.current[currentWord] || 0; // сколько раз слово уже было напечатано в этой сессии (т.е. напечатано неверно)

    const inputsThreshold = baseThreshold - (mistypeCount * 2); // колво нажатий для показа слова с учетом ошибок (больше ошибок => быстрее показывается)

    // Track whether the game is completed
    const [completed, setCompleted] = useState(false);

    const [inputCount, setInputCount] = useState(0); // количество нажатий на клаве

    // Reference to the input field for auto focus
    const inputRef = useRef<HTMLInputElement>(null);

    const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null); // результат раунда (для отрисовки обратной связи)

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
        if (!input) return;

        // Check if input is correct
        const isCorrect = input.toUpperCase() === currentWord.toUpperCase();

        // New results with current word and correctness
        const newResults: { word: string; correct: boolean }[] = results.concat({ word: currentWord, correct: isCorrect });

        // Update results
        setResults(newResults);

        attemptCounts.current[currentWord] = (attemptCounts.current[currentWord] || 0) + 1;

        const nextQueue = queue.slice(1); // убрать 1й элемент в очереди
        if (!isCorrect)
            nextQueue.push(queue[0]); // запихнуть в конец очереди если неправильно написано

        setFeedback(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => {
            // Move to next word if available
            if (nextQueue.length > 0) {
                setQueue(nextQueue);
                setInput('');
            } else {
                // Game is complete, calculate summary

                const distinct = [...new Set(newResults.map(obj => obj.word))] as string[];
                const distinctIncorrect = [...new Set(newResults.filter(r => !r.correct).map(obj => obj.word))] as string[];
                const percentage = newResults.length === 0 ? 0 : 100 - (newResults.filter(r => !r.correct).length / newResults.length) * 100;

                const gameResult: GameResult = {
                    successRate: percentage,
                    completedWords: distinct,
                    failedWords: distinctIncorrect,
                    rawLog: newResults
                };
                console.log("SpellingGame GameResult:", gameResult);

                setCompleted(true);
                onComplete(gameResult); // Notify parent of completion
            }
            setFeedback(null);
        }, 500);
    }

    return (
        <BaseGame title="Spelling game" description="Guess the word and type it below">
            {!completed ? (
                // TODO? анимация (обратная связь)
                <div className={`gamearea ${feedback === 'correct' ? 'glow' : ''} ${feedback === 'wrong' ? 'shake' : ''}`}>
                    <p className="lead">Word definition:</p>
                    {currentHint && (
                        <h5 className="mb-3">{currentHint}</h5>
                    )}

                    {/* Показать слово после inputsThreshold нажатий (фора - длина слова) */}
                    {inputCount >= (inputsThreshold + currentWord.length) && (
                        <div className="alert alert-info">The word is: <strong>{currentWord.toUpperCase()}</strong></div>
                    )}

                    {/* Input field for spelling */}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type the word here..."
                        // className="form-control my-3"
                        // TODO? анимация (обратная связь)
                        className={`form-control my-3 input-box ${feedback}`}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value.trim().toUpperCase());
                            setInputCount(prev => prev + 1);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        autoComplete="off"
                    />

                    {/* Button to submit the word */}
                    <button className="btn btn-primary" onClick={handleSubmit}>Check</button>
                </div>
            ) : (
                // Summary after game ends
                <div className="alert alert-success mt-4">
                    <h5>🎉 Game Completed!</h5>
                    <p>Success Rate: {(
                        results.length === 0 ? 0 : 100 - (results.filter(r => !r.correct).length / results.length) * 100
                    ).toFixed(0)}%</p>
                </div>
            )}
        </BaseGame>
    );
};

export default SpellingGame;
// const SpellingGame: React.FC<GameProps> = ({ data, onComplete }) => {
//     console.log("SpellingGame data:", data);
//
//     // Extract the list of words from the game data (fallback to empty array)
//     const words = data?.word_list || [];
//
//     // Track current word index
//     const [index, setIndex] = useState(0);
//
//     // Store the user's current input
//     const [input, setInput] = useState('');
//
//     // Store result history per word: correct or wrong
//     const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
//
//     // Track whether the game is completed
//     const [completed, setCompleted] = useState(false);
//
//     // Reference to the input field for auto focus
//     const inputRef = useRef<HTMLInputElement>(null);
//
//     // Get the current word in uppercase
//     const currentWord = words[index]?.word?.toUpperCase() ?? '';
//
//     // Auto-focus the input on each new word
//     useEffect(() => {
//         inputRef.current?.focus();
//     }, [index]);
//
//     // Handle word submission
//     const handleSubmit = () => {
//         if (!currentWord) return;
//
//         // Check if input is correct
//         const isCorrect = input === currentWord;
//
//         // Update results with current word and correctness
//         const newResults = [...results, { word: currentWord, correct: isCorrect }];
//         setResults(newResults);
//
//         // Move to next word if available
//         if (index + 1 < words.length) {
//             setIndex(index + 1);
//             setInput('');
//         } else {
//             // Game is complete, calculate summary
//             const correctWords = newResults.filter(r => r.correct).map(r => r.word);
//             const failedWords = newResults.filter(r => !r.correct).map(r => r.word);
//
//             const gameResult: GameResult = {
//                 successRate: (correctWords.length / words.length) * 100,
//                 completedWords: correctWords,
//                 failedWords: failedWords,
//                 rawLog: newResults
//             };
//
//             setCompleted(true);
//             onComplete(gameResult); // Notify parent of completion
//         }
//     };
//
//     return (
//         <BaseGame title="Spelling Game">
//             {!completed ? (
//                 <>
//                     <p className="lead">Spell the word:</p>
//                     <h3>{currentWord}</h3>
//
//                     {/* Input field for spelling */}
//                     <input
//                         ref={inputRef}
//                         type="text"
//                         className="form-control my-3"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value.toUpperCase())}
//                         onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
//                         autoComplete="off"
//                     />
//
//                     {/* Button to submit the word */}
//                     <button className="btn btn-primary" onClick={handleSubmit}>Check</button>
//                 </>
//             ) : (
//                 // Summary after game ends
//                 <div className="alert alert-success mt-4">
//                     <h5>🎉 Game Completed!</h5>
//                     <p>Success Rate: {(
//                         results.filter(r => r.correct).length / words.length * 100
//                     ).toFixed(0)}%</p>
//                 </div>
//             )}
//         </BaseGame>
//     );
// };

