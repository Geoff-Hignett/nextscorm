import { create } from "zustand";

type RuntimeState = {
    isDevMode: boolean;
    isDebugVisible: boolean;
    toggleDebug: () => void;
};

export const useRuntimeStore = create<RuntimeState>((set) => ({
    // This can be driven by env, query param, or LMS flag
    isDevMode: process.env.NODE_ENV !== "production",
    isDebugVisible: false,

    toggleDebug: () => set((state) => ({ isDebugVisible: !state.isDebugVisible })),
}));
