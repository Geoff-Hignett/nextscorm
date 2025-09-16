"use client";

import { useLangStore } from "@/stores/langStore";

export default function LangSelector() {
    const { activeLang, loadLang, i18nUI } = useLangStore();

    // pull the lang_options array from activeLang.ui
    const langOptions = activeLang?.ui.find((f) => f.key === "lang_options")?.langs ?? [];

    return (
        <div className="lang-selector">
            <label className="mr-2">{i18nUI("lang_selector_label")}:</label>
            <select value={activeLang?.isocode ?? ""} onChange={(e) => loadLang(e.target.value)} className="border rounded px-2 py-1">
                {langOptions.map((opt: any) => (
                    <option key={opt.code} value={opt.code}>
                        {opt.Text}
                    </option>
                ))}
            </select>
        </div>
    );
}
