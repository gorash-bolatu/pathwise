import React, { useState, useEffect } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './sentence_game.css';
import './shake_anim.css';

interface SentenceData {
    sentence: string[];
    attempts: number;
}

interface SentenceBuildingData {
    sentence_list: Array<{ sentence: string[] }>; // Correct sentence only
}

const SentenceBuildingGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    const typedData = data as SentenceBuildingData;

    const isValidData =
        Array.isArray(typedData?.sentence_list) &&
        typedData.sentence_list.every(sentence => Array.isArray(sentence.sentence));

    if (!isValidData || typedData?.sentence_list?.length === 0) {
        return <div>No sentences provided for the game!</div>;
    }

    const difficulty: 'easy' | 'normal' | 'hard' | 'no-hints' = settings?.difficulty ?? 'normal';
    const hintThresholds = { easy: 1, normal: 2, hard: 3, 'no-hints': Infinity };
    const revealThreshold = hintThresholds[difficulty];

    // Initial sentence state: each with 0 attempts
    const [queue, setQueue] = useState<SentenceData[]>(
        typedData.sentence_list.map(s => ({ sentence: s.sentence, attempts: 0 }))
    );
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [hintIndexes, setHintIndexes] = useState<number[]>([]);

    const currentSentence = queue[0];

    const [endingPunctuation, setEndingPunctuation] = useState('.');

    useEffect(() => {
        if (queue.length > 0) {
            let { sentence, attempts } = queue[0];

            // Extract and remove punctuation from last word
            let punctuation = '.';
            let processedSentence = [...sentence];

            const lastWord = sentence[sentence.length - 1];
            const lastChar = lastWord.slice(-1);

            if (['.', '!', '?'].includes(lastChar)) {
                punctuation = lastChar;
                processedSentence[processedSentence.length - 1] = lastWord.slice(0, -1);
            }

            setEndingPunctuation(punctuation);

            const wordCount = processedSentence.length;
            const emptySelection = Array(wordCount).fill(null);
            const shuffled = shuffleWords(processedSentence);

            setHintIndexes([]);

            if (attempts >= revealThreshold) {
                const indexes = Array.from(processedSentence.keys());
                const shuffledIndexes = shuffleWords(indexes);
                const fillCount = Math.floor(wordCount / 2);
                const selectedHintIndexes = shuffledIndexes.slice(0, fillCount);

                const prefilled = [...emptySelection];
                selectedHintIndexes.forEach(i => {
                    prefilled[i] = processedSentence[i];
                });

                const remaining = processedSentence.filter((_, i) => !selectedHintIndexes.includes(i));

                setSelectedWords(prefilled);
                setAvailableWords(shuffleWords(remaining));
                setShowHint(true);
                setHintIndexes(selectedHintIndexes);
            } else {
                setSelectedWords(emptySelection);
                setAvailableWords(shuffled);
                setShowHint(false);
            }
        }
    }, [queue]);


    const shuffleWords = <T,>(wordList: T[]): T[] => {
        const shuffled = [...wordList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleWordSelect = (word: string) => {
        const firstEmptyIdx = selectedWords.findIndex((w, idx) => w === null && !hintIndexes.includes(idx));
        if (firstEmptyIdx === -1) return;

        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[firstEmptyIdx] = word;
            return newSelected;
        });

        setAvailableWords(prev => prev.filter(w => w !== word));
    };

    const handleWordDeselect = (index: number) => {
        if (hintIndexes.includes(index)) return;

        const word = selectedWords[index];
        if (!word) return;

        setSelectedWords(prev => {
            const newSelected = [...prev];
            newSelected[index] = null;
            return newSelected;
        });

        setAvailableWords(prev => [...prev, word]);
    };

    const completeGame = () => {
        const gameResult: GameResult = {
            successRate: results.length === 0 ? 0 : (results.filter(r => r.correct).length / results.length) * 100,
            completedWords: [...new Set(results.filter(r => r.correct).map(r => r.word))],
            failedWords: [...new Set(results.filter(r => !r.correct).map(r => r.word))],
            rawLog: results
        };

        onComplete(gameResult);
        setCompleted(true);
    };

    const handleCheck = () => {
        if (!currentSentence || selectedWords.some(w => !w)) return;

        const builtSentence = selectedWords.join(' ').toLowerCase().trim();
        const correctSentence = currentSentence.sentence.join(' ').toLowerCase().trim();

        const normalize = (s: string) => s.replace(/[.?!]$/, '');

        const isCorrect = normalize(builtSentence) === normalize(correctSentence);

        setFeedback(isCorrect ? 'correct' : 'wrong');
        setResults(prev => [...prev, { word: currentSentence.sentence.join(' '), correct: isCorrect }]);

        setTimeout(() => {
            if (isCorrect) {
                const newQueue = queue.slice(1);
                if (newQueue.length === 0) {
                    completeGame();
                } else {
                    setQueue(newQueue);
                }
            } else {
                const updated = { ...currentSentence, attempts: currentSentence.attempts + 1 };
                const newQueue = [...queue.slice(1), updated];
                setQueue(newQueue);
            }

            setFeedback(null);
        }, 1000);
    };

    return (
        <BaseGame title="Sentence Building" description="Choose the words in the right order to make a sentence">
            {!completed ? (
                <div
                    className={`gamearea ${feedback === 'correct' ? 'glow' : ''} ${feedback === 'wrong' ? 'shake' : ''}`}>
                    <div className="sentence-container">
                        {selectedWords.map((word, idx) => {
                            const isHinted = showHint && hintIndexes.includes(idx);
                            return (
                                <span
                                    key={`${word || 'empty'}-${idx}`}
                                    className={`word-slot ${word ? 'filled' : 'empty'} ${isHinted ? 'hinted' : ''}`}
                                    onClick={() => !isHinted && handleWordDeselect(idx)}
                                >
        {word || ''}
      </span>
                            );
                        })}
                        <span className="punctuation">{endingPunctuation}</span>
                    </div>


                    {showHint && (
                        <div className="hint mt-2 mb-2">
                            <p className="text-info"><strong>Hint:</strong> Some words have been placed for you.</p>
                        </div>
                    )}

                    <div className="word-bank mb-3">
                        {availableWords.map((word, i) => (
                            <button
                                key={`${word}-${i}`}
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
                        disabled={selectedWords.some((w, idx) => w === null && !hintIndexes.includes(idx))}
                    >
                        Check
                    </button>
                </div>
            ) : (
                <div className="alert alert-success mt-4">
                    <h5>🎉 Game Completed!</h5>
                    <p>Success Rate: {((results.filter(r => r.correct).length / results.length) * 100).toFixed(0)}%</p>
                </div>
            )}
        </BaseGame>
    );
};

export default SentenceBuildingGame;
