// ---------- Types ----------

export type ScormInteraction = {
    interactionID: string;
    questionRef: string;
    questionText: string;
    questionType: string;
    questionOptions?: { option: string; key: string }[];
    learnerResponse: string;
    correctAnswer: string;
    wasCorrect: boolean | null;
    objectiveId: string;
};

export type ScormInitResult = {
    success: boolean;
    version: string;
};

export type ScormState = {
    API: any; // will be typed from scormAPI
    version: string;
    location: number;
    scormAPIConnected: boolean;
    scormConnectRun: number;
    scormInited: ScormInitResult;
    suspendData: string;
    interactions: ScormInteraction[];

    // Actions
    scormConnect: () => void;
    scormlogNotConnected: () => void;
    scormGetLocation: () => number;
    scormGetSuspendData: () => string | false;
    scormSetSuspendData: (data: object) => void;
    scormGetScore: () => number | null;
    scormGetStudentName: () => string | undefined;
    scormGetStudentID: () => string | undefined;
    scormSetComplete: () => void;
    scormSetLocation: (location: number) => void;
    scormSetScore: (score: number) => void;
    scormInitObjectives: () => void;
    scormSetObjectiveScore: (index: number, score: number) => void;
    scormSetObjectiveProgress: (index: number, progress: number) => void;
    setInteraction: (args: { interaction: number; learnerResponse: string }) => void;
    recordScormQuestion: (
        questionRef: string,
        questionType: string,
        learnerResponse: string,
        correctAnswer: string,
        wasCorrect: boolean | null,
        objectiveId: string,
        interactionID: string
    ) => void;
    reconnectAttemptIfNeeded: () => void;
    scormTerminate: () => void;
};
