import React, { useState, useEffect, useRef } from 'react';
import BaseGame from '../BaseGame';
import { GameProps, GameResult } from '../../../interfaces/GameInterfaces';
import './sentence_game.css'; // Custom styles for this game
import './shake_anim.css'; // Animation for correct/wrong answers

// Define the SentenceBuildingData interface
interface SentenceBuildingData {
    sentence_list: Array<{
        sentence: string[];  // The correct word order (array of words)
        wordList: string[];  // Words that can be used to form the sentence (array of words)
    }>;
}

const SentenceBuildingGame: React.FC<GameProps> = ({ data, settings, onComplete }) => {
    // Ensure the data conforms to the expected structure of SentenceBuildingData
    const typedData = data as SentenceBuildingData; // Type assertion for data

    // Validate the structure of the data
    const isValidData = Array.isArray(typedData?.sentence_list) &&
        typedData.sentence_list.every(sentence =>
            Array.isArray(sentence.sentence) &&
            Array.isArray(sentence.wordList) &&
            sentence.sentence.every(word =>
                sentence.wordList.map(w => w.toLowerCase()).includes(word.toLowerCase())
            )
        );

    if (!isValidData || typedData?.sentence_list?.length === 0) {
        return <div>No sentences provided for the game!</div>;
    }

    // Initialize state
    const [queue, setQueue] = useState(typedData.sentence_list || []);
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState<{ sentence: string; correct: boolean }[]>([]);

    // Reference for tracking incorrect attempts for each word
    const attemptCounts = useRef<Record<string, number>>({}); // Track attempts per sentence

    const isGameStarted = useRef(false);

    // Difficulty and reveal threshold for hints
    type Difficulty = 'easy' | 'normal' | 'hard' | 'no-hints';
    const difficulty: Difficulty = settings?.difficulty ?? 'normal';
    const hintThresholds = {
        'easy': 0,
        'normal': 1,
        'hard': 2,
        'no-hints': Infinity
    };

    const revealThreshold = hintThresholds[difficulty] ?? 1;
    const currentSentence = queue[0];
    const sentenceKey = currentSentence?.sentence.join('|') || '';
    const attempts = attemptCounts.current[sentenceKey] || 0;
    const hintsToShow = Math.max(0, attempts - revealThreshold);

    // Initialize attempt counts only when the game starts
    useEffect(() => {
        if (queue.length > 0 && !isGameStarted.current) {
            const initialCounts = queue[0].wordList.reduce((acc, word) => ({ ...acc, [word]: 0 }), {});
            attemptCounts.current = initialCounts;
            isGameStarted.current = true;

            // Initialize availableWords and selectedWords
            const shuffled = shuffleWords(queue[0].wordList);
            setAvailableWords(shuffled);
            setSelectedWords(Array(queue[0].sentence.length).fill(null));
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

    // Handle word selection (adding words to the sentence)
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

    // Handle word deselection (removing words from the sentence)
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
    
    // Complete the game and calculate the final result
    const completeGame = () => {
        const gameResult: GameResult = {
            successRate: results.length === 0 ? 0 : (results.filter((r) => r.correct).length / results.length) * 100,
            completedWords: [...new Set(results.filter((r) => r.correct).map((r) => r.sentence))],
            failedWords: [...new Set(results.filter((r) => !r.correct).map((r) => r.sentence))],
            rawLog: results
        };

        onComplete(gameResult);
        setCompleted(true);
    };

    // Check if the built sentence matches the correct sentence
    const handleCheck = () => {
        if (!currentSentence || selectedWords.some((w) => !w)) return;
      
        // Validate the built sentence (case-insensitive comparison):
        const builtSentence = selectedWords.join(' ').toLowerCase();
        const correctSentence = currentSentence.sentence.join(' ').toLowerCase();
        const isCorrect = builtSentence === correctSentence;
        
        setFeedback(isCorrect ? 'correct' : 'wrong');
        setResults((prev) => [...prev, { sentence: currentSentence.sentence.join(' '), correct: isCorrect }]);
      
        const sentenceKey = currentSentence.sentence.join('|');
        if (!isCorrect) {
          attemptCounts.current[sentenceKey] = (attemptCounts.current[sentenceKey] || 0) + 1;
        }
      
        setTimeout(() => {
          if (isCorrect) {
            const newQueue = queue.slice(1);
            if (newQueue.length === 0) {
              completeGame(); // Critical fix: Call completion here
            } else {
              setQueue(newQueue);
            }
          } else {
            setQueue([...queue.slice(1), queue[0]]);
          }
          setFeedback(null);
        }, 1000);
      };


    return (
        <BaseGame title="Sentence Building" description="Build the correct sentence by selecting words in the right order">
            {!completed ? (
                <div className={`gamearea ${feedback === 'correct' ? 'glow' : ''} ${feedback === 'wrong' ? 'shake' : ''}`}>
                    <div className="sentence-container">
                        {selectedWords.map((chosenWord: string, idx: number) => (
                            <span
                                key={idx}
                                className={`word-slot ${chosenWord ? 'filled' : 'empty'}`}
                                onClick={() => handleWordDeselect(idx)}
                            >
                                {chosenWord || ''}
                            </span>
                        ))}
                    </div>

                    <div className="word-bank mb-3">
                        {availableWords.map((word, i) => {
                            // Track all positions of the current word in the correct sentence
                            const correctPositions = currentSentence.sentence
                                .map((correctWord, idx) =>
                                    correctWord.toLowerCase() === word.toLowerCase() ? idx : -1
                                )
                                .filter(idx => idx !== -1);

                            // Determine if any of the positions are within the hint threshold
                            const shouldGlow = correctPositions.some(pos => pos < hintsToShow);

                            return (
                                <button
                                    key={`${word}-${i}`}
                                    className={`btn btn-outline-primary m-1 ${shouldGlow ? 'hint-glow' : ''}`}
                                    onClick={() => handleWordSelect(word)}
                                >
                                    {word}
                                </button>
                            );
                        })}
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
                    <p>
                        Success Rate: {((results.filter((r) => r.correct).length / results.length) * 100).toFixed(0)}%
                    </p>
                </div>
            )}
        </BaseGame>
    );
};

export default SentenceBuildingGame;
