// ---------- Field / Route ----------

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

// ---------- UI ----------

export type LangOption = {
    code: string;
    Text: string;
};

/**
 * Normal UI text field
 * (explicitly excludes "lang_options" to keep the union discriminated)
 */
export type UITextField = {
    key: Exclude<string, "lang_options">;
    Text: string;
};

/**
 * Language selector options field
 */
export type LangOptionsField = {
    key: "lang_options";
    langs: LangOption[];
};

export type UIField = UITextField | LangOptionsField;

// ---------- Language ----------

export type Language = {
    isocode: string;
    friendlyname: string;
    langID: number;
    ui: UIField[];
    routes: Route[];
};

// ---------- Store ----------

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
