export interface GameProps {
    data: any;
    onComplete: (result: GameResult) => void;
}

export interface GameResult {
    successRate: number;
    completedWords: string[];
    failedWords: string[];
    rawLog: { word: string; correct: boolean }[];
}
