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

// ---------- Store ----------
export const useScormStore = create<ScormState>((set, get) => ({
    API: scormAPI,
    version: "",
    location: 0,
    scormAPIConnected: false,
    scormConnectRun: 0,
    scormInited: { success: false, version: "" },
    suspendData: "",
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
            return;
        }
        console.log("---SCORM connect---");
        state.API.configure({ version: "2004", debug: true });
        const result = state.API.initialize();
        set({
            scormInited: result,
            scormConnectRun: state.scormConnectRun + 1,
            scormAPIConnected: result.success,
            version: result.version,
        });
        console.warn("SCORM VERSION", result.version);

        const currentStatus = result.version === "1.2" ? state.API.get("cmi.core.lesson_status") : state.API.get("cmi.completion_status");

        if (!["completed", "passed"].includes(currentStatus?.toLowerCase())) {
            console.log("mark course incomplete");
            if (result.version === "1.2") {
                state.API.set("cmi.core.lesson_status", "incomplete");
            } else {
                state.API.set("cmi.completion_status", "incomplete");
            }
        }
    },

    scormlogNotConnected: () => {
        console.warn("SCORM not connected");
    },

    scormGetLocation: () => {
        const state = get();
        let loc = "0";
        if (state.scormAPIConnected) {
            loc = state.version === "1.2" ? state.API.get("cmi.core.lesson_location") : state.API.get("cmi.location");
        } else {
            loc = sessionStorage.getItem("bookmark") ?? "0";
        }
        console.log(loc);
        return parseInt(loc);
    },

    scormGetSuspendData: () => {
        const state = get();
        if (state.scormAPIConnected) {
            const suspendData = state.API.get("cmi.suspend_data");
            console.log(suspendData);
            return suspendData;
        } else {
            console.log("scorm not connected");
            return false;
        }
    },

    scormSetSuspendData: (data: object) => {
        const state = get();
        state.reconnectAttemptIfNeeded();

        /**
         * SCORM suspend_data encoding:
         * - Avoids LMS character restrictions and truncation
         * - Must be reversed on read
         * - Compatible with SCORM 1.2 length limits
         */
        let jsonData = JSON.stringify(data).replace(/[']/g, "¬").replace(/["]+/g, "~").replace(/[,]/g, "|");

        if (state.scormAPIConnected) {
            if (state.version === "1.2" && jsonData.length > 4096) {
                throw new Error("Suspend Data length cannot exceed 4096 on SCORM 1.2");
            }
            state.API.set("cmi.suspend_data", jsonData);
        } else {
            sessionStorage.setItem("suspend_data", jsonData);
        }

        sessionStorage.setItem("suspend_data_str", jsonData);
        sessionStorage.setItem("suspend_data", JSON.stringify(data));
        set({ suspendData: jsonData });
        state.API.commit();
    },

    scormGetScore: () => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.warn("SCORM not connected — cannot get score");
            return null;
        }
        const scoreStr = state.version === "1.2" ? state.API.get("cmi.core.score.raw") : state.API.get("cmi.score.raw");
        if (!scoreStr) {
            console.warn("No score found in SCORM data");
            return null;
        }
        const score = Number(scoreStr);
        if (isNaN(score)) {
            console.warn("SCORM score is not a number:", scoreStr);
            return null;
        }
        return score;
    },

    scormGetStudentName: () => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.log("attempting getStudentName but scorm not connected");
            return;
        }
        const name = state.version === "1.2" ? state.API.get("cmi.core.student_name") : state.API.get("cmi.learner_name");
        console.log("Student Name:", name);
        return name;
    },

    scormGetStudentID: () => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.log("attempting getStudentID but scorm not connected");
            return;
        }
        const id = state.version === "1.2" ? state.API.get("cmi.core.student_id") : state.API.get("cmi.learner_id");
        console.log("Student ID:", id);
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
            console.log("scorm not connected cant set location");
        }
    },

    scormSetScore: (score: number) => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        console.log("setting score:", score);
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
        } else {
            console.warn("SCORM not connected, cannot initialize objectives");
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
        } else {
            console.warn("SCORM not connected, cannot set objective score");
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
        } else {
            console.warn("SCORM not connected, cannot set objective progress");
        }
    },

    setInteraction: ({ interaction, learnerResponse }) => {
        const state = get();
        const current = state.interactions[interaction];
        if (!current) return;
        current.learnerResponse = learnerResponse;
        current.wasCorrect = learnerResponse === current.correctAnswer;
        set({ interactions: [...state.interactions] });
    },

    recordScormQuestion: (questionRef, questionType, learnerResponse, correctAnswer, wasCorrect, objectiveId, interactionID) => {
        const state = get();
        if (!state.scormAPIConnected) {
            console.warn("SCORM not connected — skipping interaction log");
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
    },

    reconnectAttemptIfNeeded: () => {
        const state = get();
        if (!state.scormConnectRun && !state.scormAPIConnected) {
            console.log("SCORM not connected, reconnecting...");
            state.scormConnect();
        }
    },

    scormTerminate: () => {
        const state = get();
        state.reconnectAttemptIfNeeded();
        if (state.scormAPIConnected) {
            state.API.terminate();
        } else {
            state.scormlogNotConnected();
        }
    },
}));
