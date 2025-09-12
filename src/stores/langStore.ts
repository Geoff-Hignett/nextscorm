/**
 * LangStore
 * ----------
 * Global state for internationalisation.
 * - Holds all loaded languages
 * - Provides helpers (i18nR, i18nUI) for route, component, and UI translations
 * - Used by LangSelector and page components
 */

import { create } from "zustand";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";

type Field = {
    key: string;
    Text: string;
};

type Route = {
    url: string;
    title: string;
    pageID: number;
    fields: Field[];
};

type Language = {
    isocode: string;
    friendlyname: string;
    langID: number;
    ui: Field[];
    routes: Route[];
};

type LangState = {
    activeLangIndex: number;
    languages: Language[];
    setActiveLang: (index: number) => void;
    findPageByPath: (path: string) => Route | undefined;
    i18nR: (path: string, key: string) => string;
    i18nUI: (key: string) => string;
};

export const useLangStore = create<LangState>((set, get) => ({
    activeLangIndex: 0,
    languages: [EN.language, FR.language, ES.language],

    setActiveLang: (index: number) => {
        if (index >= 0 && index < get().languages.length) {
            set({ activeLangIndex: index });
        }
    },

    findPageByPath: (path: string) => {
        const { activeLangIndex, languages } = get();
        return languages[activeLangIndex].routes.find((r) => r.url === path);
    },

    i18nR: (path: string, key: string) => {
        const page = get().findPageByPath(path);
        if (!page) return key;
        const field = page.fields.find((f) => f.key === key);
        return field ? field.Text : "TEXT NOT FOUND";
    },

    i18nUI: (key: string) => {
        const { activeLangIndex, languages } = get();
        const field = languages[activeLangIndex].ui.find((f) => f.key === key);
        return field ? field.Text : "TEXT NOT FOUND";
    },
}));
