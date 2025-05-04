import React, { useState, useEffect, useRef } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './blank_game.css';
import './shake_anim.css';

interface BlankFillData {
    sentence_list: Array<{
        parts: Array<{ type: 'text' | 'blank'; content: string }>;
        wordList: string[];
        correctWords: string[];
    }>;
}

const BlankFillGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    // State to manage sentences, selected words, and game feedback
    const typedData = data as BlankFillData; // Type assertion (temporary fix)
    const [queue, setQueue] = useState(typedData.sentence_list || []);
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
    const [showHints, setShowHints] = useState<boolean>(false);

    // Reference to track incorrect attempts for each word
    const attemptCounts = useRef<Record<string, number>>({});
    const difficulty = settings?.difficulty ?? 'normal';

    // Initialize attempt counts when the game starts or when sentences change
    useEffect(() => {
        if (queue.length > 0) {
            const initialCounts = queue[0].wordList.reduce((acc, word) => {
                acc[word] = 0; // Start with 0 incorrect attempts for each word
                return acc;
            }, {} as Record<string, number>);
            attemptCounts.current = initialCounts;
        }
    }, [queue]);

    // Adjust hint visibility based on difficulty setting
    useEffect(() => {
        if (difficulty === 'no-hints') {
            setShowHints(false); // Hide hints for no-hints difficulty
        } else {
            setShowHints(true); // Show hints for other difficulty settings
        }
    }, [difficulty]);

    // Handle word selection for blanks
    const handleWordSelect = (word: string) => {
        const firstEmptyIdx = selectedWords.findIndex(sw => sw === null);
        if (firstEmptyIdx === -1) return;

        // Place selected word into the first empty blank and update available words
        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[firstEmptyIdx] = word;
            return newSelected;
        });
        setAvailableWords(prev => prev.filter(w => w !== word));
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
        const validation = selectedWords.map((word, index) => ({
            word: word!,
            correct: word === currentSentence.correctWords[index]
        }));

        // Check if all answers are correct
        const allCorrect = validation.every(v => v.correct);
        setFeedback(allCorrect ? 'correct' : 'wrong');
        setResults(prev => [...prev, ...validation]);

        // Update incorrect attempt counts and re-add the sentence to the queue if incorrect
        validation.forEach(v => {
            if (!v.correct) {
                const newCounts = { ...attemptCounts.current };
                newCounts[v.word] = (newCounts[v.word] || 0) + 1;
                attemptCounts.current = newCounts;
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
            successRate: results.length === 0 ? 0 : (results.filter(r => r.correct).length / results.length) * 100,
            completedWords: [...new Set(results.filter(r => r.correct).map(r => r.word))] as string[],
            failedWords: [...new Set(results.filter(r => !r.correct).map(r => r.word))] as string[],
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
                        {currentSentence.parts.map((part, i) => (
                            part.type === 'text' ? (
                                <span key={i}>{part.content}</span>
                            ) : (
                                <span
                                    key={i}
                                    className={`blank ${selectedWords[i] ? 'filled' : 'empty'} 
                                    ${showHints && attemptCounts.current[currentSentence?.wordList[i]] >= 2 ? 'hint' : ''}`}
                                    style={{ width: selectedWords[i] ? `${selectedWords[i].length}ch` : 'auto' }}
                                    onClick={() => handleWordDeselect(i)}
                                >
                                    {showHints && attemptCounts.current[currentSentence.wordList[i]] >= 2
                                        ? currentSentence.wordList[i]
                                        : selectedWords[i] || ''}
                                </span>
                            )
                        ))}
                    </div>

                    <div className="word-bank mb-3">
                        {availableWords.map((word, i) => (
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
                        disabled={selectedWords.some(w => !w)}
                    >
                        Check
                    </button>
                </div>
            ) : (
                // Summary after game ends
                <div className="alert alert-success mt-4">
                    <h5>🎉 Game Completed!</h5>
                    <p>Success Rate: {(
                        (results.filter(r => r.correct).length / results.length) * 100
                    ).toFixed(0)}%</p>
                </div>
            )}
        </BaseGame>
    );
};

export default BlankFillGame;
