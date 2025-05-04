import React, { useState, useEffect, useRef } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './blank_game.css';
import './shake_anim.css';

const BlankFillGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    const [queue, setQueue] = useState(data.sentence_list || []);
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
    const [showHints, setShowHints] = useState<boolean>(false);

    const attemptCounts = useRef<Record<string, number>>({}); // Track incorrect attempts
    const difficulty = settings?.difficulty ?? 'normal';

    useEffect(() => {
        if (queue.length > 0) {
            const blanksCount = queue[0].correctWords.length;
            setSelectedWords(Array(blanksCount).fill(null));
            setAvailableWords([...queue[0].wordList]);
        }
    }, [queue]);

    useEffect(() => {
        // Adjust hint visibility based on difficulty and incorrect attempts
        if (difficulty === 'no-hints') {
            setShowHints(false); // Hide hints in no-hints mode
        } else {
            setShowHints(true);
        }
    }, [difficulty]);

    const handleWordSelect = (word: string) => {
        const firstEmptyIdx = selectedWords.findIndex(sw => sw === null);
        if (firstEmptyIdx === -1) return;

        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[firstEmptyIdx] = word;
            return newSelected;
        });

        setAvailableWords(prev => prev.filter(w => w !== word));
    };

    const handleWordDeselect = (index: number) => {
        const word = selectedWords[index];
        if (!word) return;

        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[index] = null;
            return newSelected;
        });

        setAvailableWords(prev => [...prev, word]);
    };

    const handleCheck = () => {
        const currentSentence = queue[0];
        if (!currentSentence || selectedWords.some(w => !w)) return;

        // Validate answers
        const validation = selectedWords.map((word, index) => ({
            word: word!,
            correct: word === currentSentence.correctWords[index]
        }));

        const allCorrect = validation.every(v => v.correct);
        setFeedback(allCorrect ? 'correct' : 'wrong');
        setResults(prev => [...prev, ...validation]);

        // Update incorrect attempts and re-add sentence to queue if incorrect
        validation.forEach(v => {
            if (!v.correct) {
                attemptCounts.current[v.word] = (attemptCounts.current[v.word] || 0) + 1;
            }
        });

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

    const completeGame = () => {
        const successRate = (results.filter(r => r.correct).length / results.length) * 100;

        const gameResult: GameResult = {
            successRate,
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
    ${showHints && attemptCounts.current[currentSentence.wordList[i]] >= 2 ? 'hint' : ''}`}
                                    style={{ width: selectedWords[i] ? `${selectedWords[i].length}ch` : 'auto' }}
                                    onClick={() => handleWordDeselect(i)}
                                >{showHints && attemptCounts.current[currentSentence.wordList[i]] >= 2
                                    ? currentSentence.wordList[i]
                                    : selectedWords[i] || ''}</span>
                            )
                        ))}
                    </div>

                    <div className="word-bank mb-3">
                        {availableWords.map((word, i) => (
                            <button
                                key={i}
                                className="btn btn-outline-primary m-1"
                                onClick={() => handleWordSelect(word)}
                            >{word}</button>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleCheck}
                        disabled={selectedWords.some(w => !w)}
                    >Check</button>
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