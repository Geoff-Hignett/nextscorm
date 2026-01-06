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
