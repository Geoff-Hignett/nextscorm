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

export type Language = {
    isocode: string;
    friendlyname: string;
    langID: number;
    ui: UIField[];
    routes: Route[];
};
