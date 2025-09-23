/**
 * LangStore
 * ----------
 * Global state for internationalisation.
 * - Supports local JSON, per-language API, and all-languages API
 * - Provides helpers (i18nR, i18nUI) for route, component, and UI translations
 */

import { create, StateCreator } from "zustand";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";
import type { LangState, Language, Mode } from "./langTypes";

// ---------- Local Language Map ----------
const localLangs: Record<string, Language> = {
    "en-GB": EN.language as Language,
    "fr-FR": FR.language as Language,
    "es-ES": ES.language as Language,
};

// ---------- Store ----------
export const useLangStore = create<LangState>(((set, get) => {
    const defaultLang = "en-GB";
    const mode: Mode = "local";

    return {
        mode,
        defaultLang,
        availableLangs: Object.keys(localLangs),
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

            if (!field) return "TEXT NOT FOUND";

            // only return .Text if this is a "normal case"
            if ("Text" in field) {
                return field.Text;
            }

            // if it's the lang_options field, decide what to return
            return "TEXT NOT FOUND";
        },
    };
}) as StateCreator<LangState>);
