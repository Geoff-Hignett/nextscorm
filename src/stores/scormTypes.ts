import { ScormInitResult, ScormInteraction } from "@/types/scorm";

export type ScormState = {
    API: any; // will be typed from scormAPI
    version: string;
    scormAPIConnected: boolean;
    scormConnectRun: number;
    scormInited: ScormInitResult;
    suspendData: string | null;
    location: number | null;
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
    hydrateFromPersistence: () => void;
};
