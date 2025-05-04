export interface GameProps {
    data: any;
    // от ильи:
        // массив параметров, чтобы я потом вынес его в интерфейс и  дальнейшем мог настраивать эти настройки через UI или задавать их в бд
    settings?: {}[];
    onComplete: (result: GameResult) => void;
}

export interface GameResult {
    successRate: number;
    completedWords: string[];
    failedWords: string[];
    rawLog: { word: string; correct: boolean }[];
}
