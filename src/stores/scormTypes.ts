import { ScormInitResult } from "@/types/scorm";
import type { ScormRuntimeAPI } from "@/types/scormApi";

export type ScormState = {
    API: ScormRuntimeAPI;
    version: string;
    scormAPIConnected: boolean;
    scormConnectRun: number;
    scormInited: ScormInitResult;
    suspendData: string | null;
    location: number | null;

    // Actions
    scormConnect: () => void;
    scormlogNotConnected: () => void;
    scormGetLocation: () => number;
    scormGetSuspendData: () => string | null | false;
    scormSetSuspendData: (data: object) => void;
    scormGetScore: () => number | null;
    scormGetStudentName: () => string | null | undefined;
    scormGetStudentID: () => string | null | undefined;
    scormSetComplete: () => void;
    scormSetLocation: (location: number) => void;
    scormSetScore: (score: number) => void;
    reconnectAttemptIfNeeded: () => void;
    scormTerminate: () => void;
    hydrateFromPersistence: () => void;
};
