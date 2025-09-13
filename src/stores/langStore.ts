/**
 * LangStore
 * ----------
 * Global state for internationalisation.
 * - Supports both local JSON and API-driven languages
 * - Provides helpers (i18nR, i18nUI) for route, component, and UI translations
 * - Exposes availableLangs for LangSelector
 */

import { create } from "zustand";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";

// ---------- Types ----------
export type Field = {
    key: string;
    Text: string;
};

export type Route = {
    url: string;
    title: string;
    pageID: number;
    fields: Field[];
};

export type Language = {
    isocode: string;
    friendlyname: string;
    langID: number;
    ui: Field[];
    routes: Route[];
};

type Mode = "local" | "api";

type LangState = {
    mode: Mode;
    defaultLang: string; // 👈 new
    availableLangs: string[];
    activeLang?: Language;
    isLoading: boolean;
    error?: string;
    setMode: (mode: Mode) => void;
    loadLang: (code?: string) => Promise<void>; // 👈 optional param
    findPageByPath: (path: string) => Route | undefined;
    i18nR: (path: string, key: string) => string;
    i18nUI: (key: string) => string;
};

// ---------- Local Language Map ----------
const localLangs: Record<string, Language> = {
    "en-GB": EN.language,
    "fr-FR": FR.language,
    "es-ES": ES.language,
};

// ---------- Store ----------
export const useLangStore = create<LangState>((set, get) => ({
    mode: "local",
    defaultLang: "en-GB", // 👈 set default here
    availableLangs: Object.keys(localLangs),
    activeLang: undefined,
    isLoading: false,
    error: undefined,

    setMode: (mode) => set({ mode }),

    loadLang: async (code) => {
        const { mode, defaultLang } = get();
        const langCode = code ?? defaultLang; // 👈 fallback

        set({ isLoading: true, error: undefined });

        try {
            if (mode === "local") {
                const lang = localLangs[langCode];
                if (!lang) throw new Error(`No local language: ${langCode}`);
                set({ activeLang: lang, isLoading: false });
            } else {
                const res = await fetch(`/api/lang/${langCode}`);
                if (!res.ok) throw new Error(`API error: ${res.statusText}`);
                const lang = (await res.json()) as Language;
                set({ activeLang: lang, isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    findPageByPath: (path) => {
        const { activeLang } = get();
        return activeLang?.routes.find((r) => r.url === path);
    },

    i18nR: (path, key) => {
        const page = get().findPageByPath(path);
        if (!page) return key;
        const field = page.fields.find((f) => f.key === key);
        return field ? field.Text : "TEXT NOT FOUND";
    },

    i18nUI: (key) => {
        const { activeLang } = get();
        const field = activeLang?.ui.find((f) => f.key === key);
        return field ? field.Text : "TEXT NOT FOUND";
    },
}));
