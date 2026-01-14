/**
 * ScormStore
 * ----------
 * Global state for SCORM runtime tracking.
 * - Manages connection to the SCORM API (SCORM 1.2 / 2004)
 * - Provides actions to set/get suspend data, score, location, objectives, and interactions
 * - Handles reconnection attempts and clean termination
 */

import { create } from "zustand";
import { scormAPI } from "@/lib/scormApi";
import type { ScormState } from "./scormTypes";
import { debugLog } from "@/lib/infra/debugLogger";

// ---------- Store ----------
export const useScormStore = create<ScormState>((set, get) => ({
    API: scormAPI,
    version: "",
    scormAPIConnected: false,
    scormConnectRun: 0,
    scormInited: { success: false, version: "" },
    suspendData: null,
    location: null,
    interactions: [
        {
            interactionID: "0",
            questionRef: "q1",
            questionText: "What is 2 + 2?",
            questionType: "numeric",
            learnerResponse: "",
            correctAnswer: "4",
            wasCorrect: null,
            objectiveId: "obj1",
        },
        {
            interactionID: "1",
            questionRef: "q2",
            questionText: "Pick a fruit",
            questionType: "choice",
            questionOptions: [
                { option: "Apple", key: "1" },
                { option: "Banana", key: "2" },
                { option: "Orange", key: "3" },
            ],
            learnerResponse: "",
            correctAnswer: "2",
            wasCorrect: null,
            objectiveId: "obj2",
        },
    ],

    // ---------- Actions ----------
    scormConnect: () => {
        const state = get();
        if (state.scormAPIConnected) {
            console.log("---SCORM already connected---");
            debugLog("info", "scorm", "SCORM already connected");
            return;
        }
        console.log("---SCORM connect---");
        debugLog("info", "scorm", "SCORM connect attempted");

        state.API.configure({ version: "2004", debug: true });
        const result = state.API.initialize();
        set({
            scormInited: result,
            scormConnectRun: state.scormConnectRun + 1,
            scormAPIConnected: result.success,
            version: result.version,
        });

        if (result.success) {
            get().hydrateFromPersistence();
        }

        console.warn("SCORM VERSION", result.version);
        debugLog("info", "scorm", "SCORM initialised", {
            version: result.version,
            success: result.success,
        });

        const currentStatus = result.version === "1.2" ? state.API.get("cmi.core.lesson_status") : state.API.get("cmi.completion_status");

        if (result.success && !["completed", "passed"].includes(currentStatus?.toLowerCase())) {
            console.log("mark course incomplete");
            debugLog("info", "scorm", "Marking SCORM incomplete");
            if (result.version === "1.2") {
                state.API.set("cmi.core.lesson_status", "incomplete");
            } else {
                state.API.set("cmi.completion_status", "incomplete");
            }
        }
    },

    scormlogNotConnected: () => {
        console.warn("SCORM not connected");
        debugLog("warn", "scorm", "SCORM API not connected");
    },

    scormGetLocation: () => {
        const state = get();

        if (state.scormAPIConnected) {
            const raw = state.version === "1.2" ? state.API.get("cmi.core.lesson_location") : state.API.get("cmi.location");

            return parseInt(raw || "0", 10);
        }

        const fallback = localStorage.getItem("bookmark");
        return fallback ? parseInt(fallback, 10) : 0;
    },

    scormGetSuspendData: () => {
        const state = get();
        if (state.scormAPIConnected) {
            const suspendData = state.API.get("cmi.suspend_data");
            console.log(suspendData);
            return suspendData;
        } else {
            console.log("scorm not connected");
            debugLog("warn", "scorm", "Attempted getSuspendData while SCORM disconnected");
            return false;
        }
    },

    scormSetSuspendData: (data: object) => {
        const state = get();
        state.reconnectAttemptIfNeeded();

        const encoded = JSON.stringify(data).replace(/[']/g, "¬").replace(/["]+/g, "~").replace(/[,]/g, "|");

        if (state.scormAPIConnected) {
            if (state.version === "1.2" && encoded.length > 4096) {
                throw new Error("Suspend Data length cannot exceed 4096 on SCORM 1.2");
            }

            state.API.set("cmi.suspend_data", encoded);
            state.API.commit();
        } else {
            localStorage.setItem("suspend_data", encoded);
        }

        set({ suspendData: encoded });

        debugLog("info", "scorm", "Suspend data persisted", {
            length: encoded.length,
            target: state.scormAPIConnected ? "lms" : "local",
        });
    },

    scormGetScore: () => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.warn("SCORM not connected — cannot get score");
            debugLog("warn", "scorm", "Attempted getScore while SCORM disconnected");
            return null;
        }
        const scoreStr = state.version === "1.2" ? state.API.get("cmi.core.score.raw") : state.API.get("cmi.score.raw");
        if (!scoreStr) {
            console.warn("No score found in SCORM data");
            debugLog("warn", "scorm", "No SCORM score found");
            return null;
        }
        const score = Number(scoreStr);
        if (isNaN(score)) {
            console.warn("SCORM score is not a number:", scoreStr);
            debugLog("error", "scorm", "Invalid SCORM score value", {
                value: scoreStr,
            });
            debugLog("info", "scorm", "SCORM score retrieved", { score });
            return null;
        }
        return score;
    },

    scormGetStudentName: () => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.log("attempting getStudentName but scorm not connected");
            debugLog("warn", "scorm", "Attempted getStudentName while SCORM disconnected");
            return;
        }
        const name = state.version === "1.2" ? state.API.get("cmi.core.student_name") : state.API.get("cmi.learner_name");
        console.log("Student Name:", name);
        debugLog("info", "scorm", "SCORM learner name retrieved", { name });
        return name;
    },

    scormGetStudentID: () => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.log("attempting getStudentID but scorm not connected");
            debugLog("warn", "scorm", "Attempted getStudentID while SCORM disconnected");
            return;
        }
        const id = state.version === "1.2" ? state.API.get("cmi.core.student_id") : state.API.get("cmi.learner_id");
        console.log("Student ID:", id);
        debugLog("info", "scorm", "SCORM learner ID retrieved", { id });
        return id;
    },

    scormSetComplete: () => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        if (state.scormAPIConnected) {
            if (state.version === "1.2") {
                state.API.set("cmi.core.lesson_status", "completed");
            } else {
                state.API.set("cmi.completion_status", "completed");
            }
            state.API.commit();
            debugLog("info", "scorm", "SCORM course marked complete", {
                version: state.version,
            });
        } else {
            state.scormlogNotConnected();
        }
    },

    scormSetLocation: (location: number) => {
        const state = get();
        state.reconnectAttemptIfNeeded();

        if (state.scormAPIConnected) {
            if (state.version === "1.2") {
                state.API.set("cmi.core.lesson_location", location.toString());
            } else {
                state.API.set("cmi.location", location.toString());
            }
            state.API.commit();
        } else {
            localStorage.setItem("bookmark", location.toString());
        }

        set({ location });

        debugLog("info", "scorm", "Location persisted", {
            location,
            target: state.scormAPIConnected ? "lms" : "local",
        });
    },

    scormSetScore: (score: number) => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        console.log("setting score:", score);
        debugLog("info", "scorm", "Setting SCORM score", { score });
        if (state.scormAPIConnected) {
            if (state.version === "1.2") {
                state.API.set("cmi.core.score.min", "0");
                state.API.set("cmi.core.score.max", "100");
                state.API.set("cmi.core.score.raw", score.toString());
            } else {
                state.API.set("cmi.score.min", "0");
                state.API.set("cmi.score.max", "100");
                state.API.set("cmi.score.raw", score.toString());
            }
            state.API.commit();
        }
    },

    scormInitObjectives: () => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        if (state.scormAPIConnected) {
            state.API.set("cmi.objectives.0.id", "objective_1");
            state.API.commit();
            console.log("SCORM objectives initialized");
            debugLog("info", "scorm", "SCORM objectives initialised");
        } else {
            console.warn("SCORM not connected, cannot initialize objectives");
            debugLog("warn", "scorm", "Attempted initObjectives while SCORM disconnected");
        }
    },

    scormSetObjectiveScore: (index: number, score: number) => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        if (state.scormAPIConnected) {
            const basePath = `cmi.objectives.${index}.score.raw`;
            state.API.set(basePath, score.toString());
            state.API.commit();
            console.log(`SCORM objective ${index} score set to ${score}`);
            debugLog("info", "scorm", "SCORM objective score set", {
                index,
                score,
            });
        } else {
            console.warn("SCORM not connected, cannot set objective score");
            debugLog("warn", "scorm", "Attempted setObjectiveScore while SCORM disconnected", {
                index,
            });
        }
    },

    scormSetObjectiveProgress: (index: number, progress: number) => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        if (state.scormAPIConnected) {
            const basePath = `cmi.objectives.${index}.progress_measure`;
            const value = (progress / 100).toFixed(2);
            state.API.set(basePath, value);
            state.API.commit();
            console.log(`SCORM objective ${index} progress set to ${value}`);
            debugLog("info", "scorm", "SCORM objective progress set", {
                index,
                progress,
            });
        } else {
            console.warn("SCORM not connected, cannot set objective progress");
            debugLog("warn", "scorm", "Attempted setObjectiveProgress while SCORM disconnected", {
                index,
            });
        }
    },

    setInteraction: ({ interaction, learnerResponse }) => {
        const state = get();
        const current = state.interactions[interaction];
        if (!current) return;
        current.learnerResponse = learnerResponse;
        current.wasCorrect = learnerResponse === current.correctAnswer;
        set({ interactions: [...state.interactions] });
        debugLog("info", "scorm", "Interaction updated locally", {
            interaction,
            learnerResponse,
        });
    },

    recordScormQuestion: (questionRef, questionType, learnerResponse, correctAnswer, wasCorrect, objectiveId, interactionID) => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.warn("SCORM not connected — skipping interaction log");
            debugLog("warn", "scorm", "Attempted recordScormQuestion while SCORM disconnected", {
                questionRef,
            });
            return;
        }
        const index = interactionID;
        const now = new Date();
        const scormTimestamp = now.toISOString().split(".")[0];
        const resultIncorrect = state.version === "1.2" ? "wrong" : "incorrect";

        state.API.set(`cmi.interactions.${index}.id`, questionRef);
        state.API.set(`cmi.interactions.${index}.type`, questionType);

        if (state.version === "1.2") {
            state.API.set(`cmi.interactions.${index}.student_response`, learnerResponse);
        } else {
            state.API.set(`cmi.interactions.${index}.learner_response`, learnerResponse);
            state.API.set(`cmi.interactions.${index}.timestamp`, scormTimestamp);
        }

        state.API.set(`cmi.interactions.${index}.correct_responses.0.pattern`, correctAnswer);
        state.API.set(`cmi.interactions.${index}.result`, wasCorrect ? "correct" : resultIncorrect);
        state.API.set(`cmi.interactions.${index}.objectives.0.id`, objectiveId);

        state.API.commit();
        console.log(`Interaction ${index} sent to LMS`);
        debugLog("info", "scorm", "SCORM interaction recorded", {
            interactionID,
            questionRef,
            wasCorrect,
        });
    },

    reconnectAttemptIfNeeded: () => {
        const state = get();
        if (!state.scormConnectRun && !state.scormAPIConnected) {
            console.log("SCORM not connected, reconnecting...");
            debugLog("warn", "scorm", "Reconnect attempt triggered");
            state.scormConnect();
        }
    },

    hydrateFromPersistence: () => {
        const state = get();

        if (state.scormAPIConnected) {
            const suspend = state.API.get("cmi.suspend_data");
            const loc = state.version === "1.2" ? state.API.get("cmi.core.lesson_location") : state.API.get("cmi.location");

            set({
                suspendData: suspend ?? null,
                location: loc ? parseInt(loc, 10) : null,
            });

            debugLog("info", "scorm", "Hydrated from LMS", {
                suspendLength: suspend?.length ?? 0,
                location: loc,
            });

            return;
        }

        const suspend = localStorage.getItem("suspend_data");
        const loc = localStorage.getItem("bookmark");

        set({
            suspendData: suspend ?? null,
            location: loc ? parseInt(loc, 10) : null,
        });

        debugLog("info", "scorm", "Hydrated from localStorage", {
            suspendLength: suspend?.length ?? 0,
            location: loc,
        });
    },

    scormTerminate: () => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        if (state.scormAPIConnected) {
            state.API.terminate();
            debugLog("info", "scorm", "SCORM session terminated");
        } else {
            state.scormlogNotConnected();
        }
    },
}));
