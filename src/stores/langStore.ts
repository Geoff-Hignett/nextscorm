/**
 * LangStore
 * ----------
 * Global state for internationalisation.
 * - Supports local JSON, per-language API, and all-languages API
 * - Provides helpers (i18nR, i18nUI) for route, component, and UI translations
 */

import { create, StateCreator } from "zustand";
import EN from "@/language/en-GB.json";
import FR from "@/language/fr-FR.json";
import ES from "@/language/es-ES.json";
import type { LangState, Mode } from "./langTypes";
import type { Language } from "@/types/language";

const API_BASE = process.env.NEXT_PUBLIC_LANG_API_BASE;

// ---------- Local Language Map ----------
const localLangs: Record<string, Language> = {
    "en-GB": EN.language as Language,
    "fr-FR": FR.language as Language,
    "es-ES": ES.language as Language,
};

// ---------- Store ----------
export const useLangStore = create<LangState>(((set, get) => {
    const defaultLang = "en-GB";

    const mode: Mode = (process.env.NEXT_PUBLIC_LANG_MODE as Mode) ?? "local";

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
                    if (!API_BASE) {
                        throw new Error("NEXT_PUBLIC_LANG_API_BASE not configured");
                    }

                    const res = await fetch(`${API_BASE}/lang/${langCode}.json`);
                    if (!res.ok) throw new Error(`API error: ${res.statusText}`);

                    const data = await res.json();
                    const lang = data.language as Language;

                    set({
                        activeLang: lang,
                        languages: { ...get().languages, [langCode]: lang },
                        isLoading: false,
                    });
                } else if (mode === "apiAll") {
                    if (!API_BASE) {
                        throw new Error("NEXT_PUBLIC_LANG_API_BASE not configured");
                    }

                    const res = await fetch(`${API_BASE}/langs.json`);
                    if (!res.ok) throw new Error(`API error: ${res.statusText}`);

                    const data = (await res.json()) as { language: Language }[];

                    const langMap: Record<string, Language> = {};

                    data.forEach(({ language }) => {
                        langMap[language.isocode] = language;
                    });

                    set({
                        languages: langMap,
                        activeLang: langMap[langCode],
                        isLoading: false,
                    });
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Unknown error";

                set({ error: message, isLoading: false });
            }
        },

        findPageByPath: (path) => {
            const { activeLang } = get();
            if (!activeLang) return undefined;

            const normalisedPath = path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;

            return activeLang.routes?.find((r) => r.url === normalisedPath);
        },

        i18nR: (path, key) => {
            const page = get().findPageByPath(path);
            if (!page) return key;
            const field = page.fields.find((f) => f.key === key);
            return field ? field.Text : "TEXT NOT FOUND";
        },

        i18nUI: (key) => {
            const { activeLang } = get();
            const field = activeLang?.ui?.find((f) => f.key === key);

            if (!field) return "TEXT NOT FOUND";

            if ("Text" in field) {
                return field.Text;
            }

            return "TEXT NOT FOUND";
        },
    };
}) as StateCreator<LangState>);
