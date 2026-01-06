import { Language, Route } from "@/types/language";

export type Mode = "local" | "apiSingle" | "apiAll";

export type LangState = {
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
