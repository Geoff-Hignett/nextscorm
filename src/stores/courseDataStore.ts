"use client";

import { create } from "zustand";
import { useScormStore } from "@/stores/scormStore";
import { debugLog } from "@/infra/debugLogger";

/* --------------------------------------------
 * Types
 * ------------------------------------------ */

export type CourseValue = string | number | boolean | null | undefined;

type PersistTarget = "scorm" | "local" | null;
type PersistReason = "debounced" | "batch" | "manual";

interface CourseDataState {
    data: Record<string, CourseValue>;

    // debug / observability
    lastPersistedTo: PersistTarget;
    lastPersistReason: PersistReason | null;
    lastPersistedAt: number | null;
    pendingPersist: boolean;

    // API
    setValue: (key: string, value: CourseValue) => void;
    setMany: (entries: Record<string, CourseValue>) => void;
    getValue: (key: string) => CourseValue | null;

    persist: (reason?: PersistReason) => void;
    restore: () => void;
    reset: () => void;
}

/* --------------------------------------------
 * Guardrails
 * ------------------------------------------ */

function assertSerializableValue(key: string, value: any) {
    if (typeof value === "object" && value !== null) {
        throw new Error(`CourseData "${key}" must be a primitive. Nested objects are not allowed.`);
    }
}

/* --------------------------------------------
 * Suspend data codec (SCORM-safe)
 * ------------------------------------------ */

function encodeSuspendData(data: object): string {
    return JSON.stringify(data).replace(/[']/g, "¬").replace(/["]+/g, "~").replace(/[,]/g, "|");
}

function decodeSuspendData(str: string): any {
    return JSON.parse(str.replace(/~/g, `"`).replace(/[|]/g, ",").replace(/¬/g, "'"));
}

/* --------------------------------------------
 * Debounce helper
 * ------------------------------------------ */

let persistTimer: number | null = null;

function schedulePersist(fn: () => void, delay = 500) {
    if (persistTimer) {
        clearTimeout(persistTimer);
    }

    persistTimer = window.setTimeout(() => {
        persistTimer = null;
        fn();
    }, delay);
}

/* --------------------------------------------
 * Store
 * ------------------------------------------ */

export const useCourseDataStore = create<CourseDataState>((set, get) => ({
    data: {},

    lastPersistedTo: null,
    lastPersistReason: null,
    lastPersistedAt: null,
    pendingPersist: false,

    /* ---------- API ---------- */

    setValue: (key, value) => {
        assertSerializableValue(key, value);

        set((state) => ({
            data: { ...state.data, [key]: value },
            pendingPersist: true,
        }));

        debugLog("info", "data", "Course data set", { key, value });

        schedulePersist(() => get().persist("debounced"));
    },

    setMany: (entries) => {
        Object.entries(entries).forEach(([k, v]) => assertSerializableValue(k, v));

        set((state) => ({
            data: { ...state.data, ...entries },
            pendingPersist: false,
        }));

        debugLog("info", "data", "Course data batch set", {
            keys: Object.keys(entries),
        });

        get().persist("batch");
    },

    getValue: (key) => {
        return get().data[key] ?? null;
    },

    /* ---------- Persistence ---------- */

    persist: (reason = "manual") => {
        const scorm = useScormStore.getState();
        const data = get().data;
        const encoded = encodeSuspendData(data);
        const timestamp = Date.now();

        if (scorm.scormAPIConnected) {
            if (scorm.version === "1.2" && encoded.length > 4096) {
                debugLog("error", "data", "Suspend data exceeds SCORM 1.2 limit", {
                    length: encoded.length,
                });
                throw new Error("SCORM 1.2 suspend_data limit exceeded");
            }

            scorm.scormSetSuspendData(data);

            set({
                lastPersistedTo: "scorm",
                lastPersistReason: reason,
                lastPersistedAt: timestamp,
                pendingPersist: false,
            });

            debugLog("info", "data", "Persisted course data to SCORM", {
                length: encoded.length,
                reason,
            });
        } else {
            localStorage.setItem("course_data", JSON.stringify(data));

            set({
                lastPersistedTo: "local",
                lastPersistReason: reason,
                lastPersistedAt: timestamp,
                pendingPersist: false,
            });

            debugLog("warn", "data", "Persisted course data to localStorage fallback", {
                reason,
            });
        }
    },

    restore: () => {
        const scorm = useScormStore.getState();

        if (scorm.scormAPIConnected) {
            const raw = scorm.scormGetSuspendData();
            if (raw) {
                const decoded = decodeSuspendData(raw);

                set({
                    data: decoded,
                    lastPersistedTo: "scorm",
                    lastPersistReason: "manual",
                    lastPersistedAt: Date.now(),
                    pendingPersist: false,
                });

                debugLog("info", "data", "Restored course data from SCORM", {
                    keys: Object.keys(decoded),
                });
                return;
            }
        }

        const local = localStorage.getItem("course_data");
        if (local) {
            const parsed = JSON.parse(local);

            set({
                data: parsed,
                lastPersistedTo: "local",
                lastPersistReason: "manual",
                lastPersistedAt: Date.now(),
                pendingPersist: false,
            });

            debugLog("info", "data", "Restored course data from localStorage", {
                keys: Object.keys(parsed),
            });
        }
    },

    reset: () => {
        set({
            data: {},
            lastPersistedTo: null,
            lastPersistReason: null,
            lastPersistedAt: null,
            pendingPersist: false,
        });

        debugLog("warn", "data", "Course data reset");
    },
}));
