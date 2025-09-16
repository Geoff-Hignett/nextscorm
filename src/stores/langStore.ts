/**
 * LangStore
 * ----------
 * Global state for internationalisation.
 * - Supports local JSON, per-language API, and all-languages API
 * - Provides helpers (i18nR, i18nUI) for route, component, and UI translations
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

type Mode = "local" | "apiSingle" | "apiAll";

type LangState = {
    mode: Mode;
    defaultLang: string;
    availableLangs: string[];
    languages: Record<string, Language>;
    activeLang?: Language;
    isLoading: boolean;
    error?: string;
    setMode: (mode: Mode) => void;
    loadLang: (code?: string) => Promise<void>;
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
export const useLangStore = create<LangState>((set, get) => {
    const defaultLang = "en-GB";
    const mode: Mode = "local"; // change default if needed

    return {
        mode,
        defaultLang,
        availableLangs: Object.keys(localLangs),
        // 👇 preload local mode synchronously
        languages: mode === "local" ? { [defaultLang]: localLangs[defaultLang] } : {},
        activeLang: mode === "local" ? localLangs[defaultLang] : undefined,
        isLoading: false,
        error: undefined,

        setMode: (mode) => set({ mode }),

        loadLang: async (code) => {
            const { mode, defaultLang } = get();
            const langCode = code ?? defaultLang;

            set({ isLoading: true, error: undefined });

            try {
                if (mode === "local") {
                    // local mode is already preloaded, just swap activeLang
                    const lang = localLangs[langCode];
                    if (!lang) throw new Error(`No local language: ${langCode}`);
                    set({
                        activeLang: lang,
                        languages: { ...get().languages, [langCode]: lang },
                        isLoading: false,
                    });
                } else if (mode === "apiSingle") {
                    const res = await fetch(`/api/lang/${langCode}`);
                    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
                    const lang = (await res.json()) as Language;
                    set({
                        activeLang: lang,
                        languages: { ...get().languages, [langCode]: lang },
                        isLoading: false,
                    });
                } else if (mode === "apiAll") {
                    const res = await fetch(`/api/langs`);
                    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
                    const langs = (await res.json()) as (Language & { code: string })[];

                    const langMap: Record<string, Language> = {};
                    langs.forEach((l) => {
                        langMap[l.isocode] = l;
                    });

                    set({
                        languages: langMap,
                        activeLang: langMap[langCode],
                        isLoading: false,
                    });
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
    };
});
