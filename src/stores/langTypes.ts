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

export type LangOption = { code: string; Text: string };

export type UIField =
    | { key: string; Text: string } // normal case
    | { key: "lang_options"; langs: LangOption[] }; // special case

export type Language = {
    isocode: string;
    friendlyname: string;
    langID: number;
    ui: UIField[];
    routes: Route[];
};

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
