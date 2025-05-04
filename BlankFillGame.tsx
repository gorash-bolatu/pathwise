import React, { useState, useEffect, useRef } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './blank_game.css';
import './shake_anim.css';

interface SentencePart {
    type: 'text' | 'blank';
    content: string;
}

const BlankFillGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    // Ensure data matches the expected shape (BlankFillData) before using it
    const isValidData = Array.isArray(data?.sentence_list) && data.sentence_list.every(sentence =>
        Array.isArray(sentence.parts) &&
        Array.isArray(sentence.wordList) &&
        Array.isArray(sentence.correctWords)
    );

    if (!isValidData || data?.sentence_list?.length === 0) {
        return <div>No sentences provided for the game!</div>;
    }

    // Update queue state type
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

    // Reference to track incorrect attempts for each word
    const attemptCounts = useRef<Record<string, number>>({});

    type Difficulty = 'easy' | 'normal' | 'hard' | 'no-hints';
    const difficulty: Difficulty = settings?.difficulty ?? 'normal';
    const hintThresholds = {
        'easy': 1,
        'normal': 2,
        'hard': 3,
        'no-hints': Infinity
    };
    const revealThreshold = hintThresholds[difficulty] ?? hintThresholds['normal'];

    const showHints = (word: string) => {
        return (attemptCounts.current[word] ?? 0) >= revealThreshold;
    }

    // Track if the game has started to prevent reinitialization on sentence change
    const isGameStarted = useRef(false);

    // Initialize attempt counts only when the game starts (not on each sentence change)
    useEffect(() => {
        if (queue.length > 0 && !isGameStarted.current) {
            const initialCounts = queue[0].wordList.reduce((acc: { [x: string]: number; }, word: string | number) => {
                acc[word] = 0; // Start with 0 incorrect attempts for each word
                return acc;
            }, {} as Record<string, number>);
            attemptCounts.current = initialCounts;

            // Set the flag to true after initialization
            isGameStarted.current = true;
        }
    }, [queue]); // Runs only once when the game starts

    // Handle word selection for blanks
    const handleWordSelect = (word: string) => {
        const firstEmptyIdx = selectedWords.findIndex((sw: null) => sw === null);
        if (firstEmptyIdx === -1) return;

        // Place selected word into the first empty blank and update available words
        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[firstEmptyIdx] = word;
            return newSelected;
        });
        setAvailableWords(prev => prev.filter((w: string) => w !== word));
    };

    // Handle word deselection (undo selecting a word)
    const handleWordDeselect = (index: number) => {
        const word = selectedWords[index];
        if (!word) return;

        // Remove the word from selected blanks and re-add it to available words
        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[index] = null;
            return newSelected;
        });
        setAvailableWords(prev => [...prev, word]);
    };

    // Handle the logic when the player checks their answers
    const handleCheck = () => {
        const currentSentence = queue[0];
        if (!currentSentence || selectedWords.some(w => w === null)) return; // Ensure all blanks are filled

        // Validate the selected words against the correct answers
        const validation = selectedWords.map((word: any, index: string | number) => ({
            word: word!,
            correct: word === currentSentence.correctWords[index]
        }));

        // Check if all answers are correct
        const allCorrect = validation.every((v: { correct: any; }) => v.correct);
        setFeedback(allCorrect ? 'correct' : 'wrong');
        setResults(prev => [...prev, ...validation]);

        // Update incorrect attempt counts and re-add the sentence to the queue if incorrect
        validation.forEach((v) => {
            if (!v.correct && v.word) {
                attemptCounts.current[v.word] = (attemptCounts.current[v.word] || 0) + 1;
            }
        });


        // Move to next sentence or re-add current sentence if not correct
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
            successRate: results.length === 0 ? 0 : (results.filter((r: { correct: any; }) => r.correct).length / results.length) * 100,
            completedWords: [...new Set(results.filter((r: { correct: any; }) => r.correct).map((r: { word: any; }) => r.word))] as string[],
            failedWords: [...new Set(results.filter((r: { correct: any; }) => !r.correct).map((r: { word: any; }) => r.word))] as string[],
            rawLog: results
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
                        {currentSentence.parts.map((part: { type: string; content: any; }, i: number) => (
                            part.type === 'text' ? (
                                <span key={i}>{part.content}</span>
                            ) : (
                                <span
                                    key={i}
                                    className={`blank ${selectedWords[i] ? 'filled' : 'empty'} 
                                    ${showHints(attemptCounts.current[currentSentence?.wordList[i]]) ? 'hint' : ''}`}
                                    style={{ width: selectedWords[i] ? `${selectedWords[i].length}ch` : 'auto' }}
                                    onClick={() => handleWordDeselect(i)}
                                >
                                    {showHints(attemptCounts.current[currentSentence?.wordList[i]])
                                        ? currentSentence.wordList[i]
                                        : selectedWords[i] || ''}
                                </span>
                            )
                        ))}
                    </div>

                    <div className="word-bank mb-3">
                        {availableWords.map((word: string, i: any) => (
                            <button
                                key={i}
                                className="btn btn-outline-primary m-1"
                                onClick={() => handleWordSelect(word)}
                            >
                                {word}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleCheck}
                        disabled={selectedWords.some((w: any) => !w)}
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
