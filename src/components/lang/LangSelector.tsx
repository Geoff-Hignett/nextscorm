"use client";

import { useLangStore } from "@/stores/langStore";

type LangOption = {
    code: string;
    Text: string;
};

export default function LangSelector() {
    const { activeLang, loadLang, i18nUI } = useLangStore();

    const langOptions: LangOption[] =
        activeLang?.ui?.find((f): f is Extract<typeof f, { key: "lang_options" }> => f.key === "lang_options")?.langs ?? [];

    return (
        <div className="lang-selector">
            <label className="mr-2">{i18nUI("lang_selector_label")}:</label>
            <select value={activeLang?.isocode ?? ""} onChange={(e) => loadLang(e.target.value)} className="border rounded px-2 py-1">
                {langOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                        {opt.Text}
                    </option>
                ))}
            </select>
        </div>
    );
}
