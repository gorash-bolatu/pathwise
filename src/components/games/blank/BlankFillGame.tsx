import React, { useState, useEffect } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './blank_game.css';
import './shake_anim.css';

// Type for sentence parts to ensure each part is either 'text' or 'blank'
interface SentencePart {
    type: 'text' | 'blank';
    content: string;
}
interface Sentence {
    parts: SentencePart[];
    wordList: string[];
    correctWords: string[];
}

const BlankFillGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    // Validate if data conforms to the expected structure (sentence_list array)
    const isValidData = Array.isArray(data?.sentence_list) &&
        data.sentence_list.every((sentence: Sentence) => {
            const blankCount = sentence.parts.filter(p => p.type === 'blank').length;
            return (
                Array.isArray(sentence.correctWords) &&
                sentence.correctWords.length === blankCount
            );
        });

    if (!isValidData || data?.sentence_list?.length === 0) {
        return <div>No sentences provided for the game!</div>;
    }

    // Initializing game state
    const [queue, setQueue] = useState<{ sentence: Sentence; mistakeCounter: number }[]>(data.sentence_list.map((sentence: any) => ({
        sentence,
        mistakeCounter: 0,  // Initialize mistake counter for each sentence
    })));
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);

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

    const showHints = (sentence: { sentence: Sentence; mistakeCounter: number }) => {
        return sentence.mistakeCounter >= revealThreshold;
    };

    // Initialize attempt counts only once when the game starts
    useEffect(() => {
        if (queue.length > 0) {
            const current = queue[0].sentence;
            const shuffled = shuffleWords(current.wordList);
            setAvailableWords(shuffled);
            setSelectedWords(Array(current.correctWords.length).fill(null));
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
        const currentSentenceObj = queue[0];
        const currentSentence = currentSentenceObj.sentence;
        if (!currentSentence || selectedWords.some((w) => w === null)) return;

        const validation = selectedWords.map((word, index) => ({
            word: word!,
            correct: word === currentSentence.correctWords[index],
        }));

        const allCorrect = validation.every((v) => v.correct);
        setFeedback(allCorrect ? 'correct' : 'wrong');
        setResults((prev) => [...prev, ...validation]);

        if (!allCorrect) {
            // Increment the mistake counter for the current sentence immediately
            const updatedQueue = [
                { ...currentSentenceObj, mistakeCounter: currentSentenceObj.mistakeCounter + 1 },
                ...queue.slice(1),
            ];
            setQueue(updatedQueue);
        }

        setTimeout(() => {
            if (allCorrect) {
                const newQueue = queue.slice(1);
                if (newQueue.length === 0) completeGame();
                else setQueue(newQueue);
            } else {
                // Move current (already updated) sentence to the end
                setQueue(prev => [...prev.slice(1), prev[0]]);
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

    let blankIndex = 0;
    return (
        <BaseGame title="Fill the Blanks" description="Fill the blank with a correct word">
            {!completed ? (
                <div className={`gamearea ${feedback === 'correct' ? 'glow' : ''} ${feedback === 'wrong' ? 'shake' : ''}`}>
                    <div className="sentence mb-4">
                        {currentSentence.sentence.parts.map((part, i) => {
                            if (part.type === 'text') {
                                return <span key={i}>{part.content}</span>;
                            } else {
                                const idx = blankIndex++; // Increment and use separately
                                return (
                                    <span
                                        key={i}
                                        className={`blank ${selectedWords[idx] ? 'filled' : 'empty'} 
                            ${showHints(currentSentence) ? 'hint' : ''}`}
                                        style={{
                                            width: selectedWords[idx] ? `${selectedWords[idx]!.length}ch` : 'auto',
                                        }}
                                        onClick={() => handleWordDeselect(idx)}
                                    >
                                        {selectedWords[idx] !== null
                                            ? selectedWords[idx]  // Show selected word
                                            : showHints(currentSentence)
                                                ? currentSentence.sentence.correctWords[idx]
                                                : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                                    </span>
                                );
                            }
                        })}
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
