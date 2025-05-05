import React, { useState, useEffect, useRef } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './blank_game.css';
import './shake_anim.css';

// Type for sentence parts to ensure each part is either 'text' or 'blank'
interface SentencePart {
    type: 'text' | 'blank';
    content: string;
}

const BlankFillGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    console.log("SpellingGame data:", data);
    console.log("SpellingGame settings:", settings);

    // Validate if data conforms to the expected structure (sentence_list array)
    const isValidData = Array.isArray(data?.sentence_list) && data.sentence_list.every(sentence => {
        const blankCount = sentence.parts.filter(p => p.type === 'blank').length;
        return (
            Array.isArray(sentence.correctWords) &&
            sentence.correctWords.length === blankCount // Match blanks to answers
        );
    });

    if (!isValidData || data?.sentence_list?.length === 0) {
        return <div>No sentences provided for the game!</div>;
    }

    // Initializing game state
    const [queue, setQueue] = useState<Array<{
        parts: SentencePart[];
        wordList: string[];
        correctWords: string[];
    }>>(data.sentence_list || []);

    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);

    const attemptCounts = useRef<Record<string, number>>({});  // Track incorrect attempts for words
    const isGameStarted = useRef(false);  // Track whether the game has been initialized

    // Difficulty and hint threshold setup
    type Difficulty = 'easy' | 'normal' | 'hard' | 'no-hints';
    const difficulty: Difficulty = settings?.difficulty ?? 'normal';
    const hintThresholds = {
        'easy': 1,
        'normal': 2,
        'hard': 3,
        'no-hints': Infinity,
    };

    const revealThreshold = hintThresholds[difficulty] ?? 2;

    const showHints = (word: string) => {
        return (attemptCounts.current[word] ?? 0) >= revealThreshold;
    };

    // Initialize attempt counts only once when the game starts
    useEffect(() => {
        if (queue.length > 0 && !isGameStarted.current) {
            const initialCounts = queue[0].wordList.reduce((acc: Record<string, number>, word: string) => {
                acc[word] = 0; // Initialize with 0 incorrect attempts for each word
                return acc;
            }, {} as Record<string, number>);
            attemptCounts.current = initialCounts;
            isGameStarted.current = true;
        }
    }, [queue]); // Runs only once when the game starts

    useEffect(() => {
        if (queue.length > 0) {
            const shuffled = shuffleWords(queue[0].wordList);
            setAvailableWords(shuffled);
            setSelectedWords(Array(queue[0].correctWords.length).fill(null));
        }
    }, [queue]);

    // Shuffle the word list to randomize the order
    const shuffleWords = (wordList: string[]) => {
        const shuffled = [...wordList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Word selection and deselection handlers
    const handleWordSelect = (word: string) => {
        const firstEmptyIdx = selectedWords.findIndex((sw) => sw === null);
        if (firstEmptyIdx === -1) return;  // If no empty space, return early

        // Update selected words and available words
        setSelectedWords((prev) => {
            const newSelected = [...prev];
            newSelected[firstEmptyIdx] = word;
            return newSelected;
        });
        setAvailableWords((prev) => prev.filter((w: string) => w !== word));
    };

    const handleWordDeselect = (index: number) => {
        const word = selectedWords[index];
        if (!word) return;  // If no word is selected, return early

        // Remove word from selected and add it back to available words
        setSelectedWords((prev) => {
            const newSelected = [...prev];
            newSelected[index] = null;
            return newSelected;
        });
        setAvailableWords((prev) => [...prev, word]);
    };

    // Handle check logic (answer validation)
    const handleCheck = () => {
        const currentSentence = queue[0];
        if (!currentSentence || selectedWords.some((w) => w === null)) return; // Ensure all blanks are filled

        // Validate each selected word against correct answers
        const validation = selectedWords.map((word, index) => ({
            word: word!,
            correct: word === currentSentence.correctWords[index],
        }));

        const allCorrect = validation.every((v) => v.correct); // Check if all answers are correct
        setFeedback(allCorrect ? 'correct' : 'wrong');
        setResults((prev) => [...prev, ...validation]);

        // Update incorrect attempt counts for incorrect answers
        validation.forEach((v, index) => {
            if (!v.correct) {
                const correctWord = currentSentence.correctWords[index];
                attemptCounts.current[correctWord] = (attemptCounts.current[correctWord] || 0) + 1;
            }
        });

        // Move to the next sentence or re-add current sentence if incorrect
        setTimeout(() => {
            if (allCorrect) {
                const newQueue = queue.slice(1);
                if (newQueue.length === 0) completeGame();
                else setQueue(newQueue);
            } else {
                setQueue([...queue.slice(1), queue[0]]);
            }
            setFeedback(null);
        }, 1000);
    };

    // Complete the game and calculate the final result
    const completeGame = () => {
        const gameResult: GameResult = {
            successRate: results.length === 0 ? 0 : (results.filter((r) => r.correct).length / results.length) * 100,
            completedWords: [...new Set(results.filter((r) => r.correct).map((r) => r.word))],
            failedWords: [...new Set(results.filter((r) => !r.correct).map((r) => r.word))],
            rawLog: results,
        };

        onComplete(gameResult);
        setCompleted(true);
    };

    // Render the current sentence with blanks
    const currentSentence = queue[0];

    return (
        <BaseGame title="Fill the Blanks" description="Fill all blanks with correct words from the list">
            {!completed ? (
                <div className={`gamearea ${feedback === 'correct' ? 'glow' : ''} ${feedback === 'wrong' ? 'shake' : ''}`}>
                    <div className="sentence mb-4">
                        {currentSentence.parts.map((part, i) =>
                            part.type === 'text' ? (
                                <span key={i}>{part.content}</span>
                            ) : (
                                <span
                                    key={i}
                                    className={`blank ${selectedWords[i] ? 'filled' : 'empty'} 
                                    ${showHints(attemptCounts.current[currentSentence.correctWords[i]]) ? 'hint' : ''}`}
                                    style={{ width: selectedWords[i] ? `${selectedWords[i].length}ch` : 'auto' }}
                                    onClick={() => handleWordDeselect(i)}
                                >
                                    {showHints(attemptCounts.current[currentSentence.correctWords[i]])
                                        ? currentSentence.correctWords[i]
                                        : selectedWords[i] || ''}
                                </span>
                            )
                        )}
                    </div>

                    <div className="word-bank mb-3">
                        {availableWords.map((word, i) => (
                            <button key={i} className="btn btn-outline-primary m-1" onClick={() => handleWordSelect(word)}>
                                {word}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleCheck}
                        disabled={selectedWords.some((w) => !w)}
                    >
                        Check
                    </button>
                </div>
            ) : (
                // Summary after game ends
                <div className="alert alert-success mt-4">
                    <h5>🎉 Game Completed!</h5>
                    <p>Success Rate: {(
                        results.length ? (results.filter((r: { correct: any; }) => r.correct).length / results.length * 100) : 0
                    ).toFixed(0)}%</p>
                </div>
            )}
        </BaseGame>
    );
};

export default BlankFillGame;
