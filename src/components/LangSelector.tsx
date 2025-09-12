"use client";

import { useLangStore } from "@/stores/langStore";

export default function LangSelector() {
    const { activeLangIndex, languages, setActiveLang, i18nUI } = useLangStore();

    return (
        <div className="lang-selector">
            <label className="mr-2">{i18nUI("lang_selector_label")}:</label>
            <select value={activeLangIndex} onChange={(e) => setActiveLang(Number(e.target.value))} className="border rounded px-2 py-1">
                {languages.map((lang, i) => (
                    <option key={lang.isocode} value={i}>
                        {i18nUI(`lang_${lang.isocode.split("-")[0]}`)}
                    </option>
                ))}
            </select>
        </div>
    );
}
