"use client";

import { useLangStore } from "@/stores/langStore";

export default function LangSelector() {
    const { availableLangs, activeLang, loadLang, i18nUI } = useLangStore();

    return (
        <div className="lang-selector">
            <label className="mr-2">{i18nUI("lang_selector_label")}:</label>
            <select value={activeLang?.isocode ?? ""} onChange={(e) => loadLang(e.target.value)} className="border rounded px-2 py-1">
                {availableLangs.map((code) => {
                    // try to find a friendly label in the activeLang UI array
                    const uiLabel = activeLang?.ui.find((f) => f.key === `lang_${availableLangs.indexOf(code) + 1}`)?.Text ?? code;

                    return (
                        <option key={code} value={code}>
                            {uiLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}
