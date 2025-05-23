export interface GameConfig {
    difficulty?: 'easy' | 'normal' | 'hard' | 'no-hints'
    // TODO? добавить ещё
}

export interface GameProps {
    data: any;
    onComplete: (result: GameResult) => void;
    settings?: GameConfig;
}

export interface GameResult {
    successRate: number;
    completedWords: string[];
    failedWords: string[];
    rawLog: { word: string; correct: boolean }[];
}
