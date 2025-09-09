import { create } from "zustand";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";

type Field = {
    key: string;
    Text: string;
    ImageURL: string;
};

type Route = {
    url: string;
    title: string;
    pageID: number;
    section: number;
    fields: Field[];
};

type Language = {
    isocode: string;
    friendlyname: string;
    langID: number;
    routes: Route[];
};

type LangState = {
    activeLangIndex: number;
    languages: Language[];
    setActiveLang: (index: number) => void;
    findPageByPath: (path: string) => Route | undefined;
    i18nR: (path: string, key: string) => string;
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
}));
