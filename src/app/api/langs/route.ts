import { NextResponse } from "next/server";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";
import type { Language, UIField, UITextField } from "@/stores/langTypes";
import { loadLanguage } from "@/language/loadLanguage";

// ---------- Type guard ----------
function isUITextField(field: UIField): field is UITextField {
    return "Text" in field;
}

// ---------- Language map ----------
const langs: Record<string, Language> = {
    "en-GB": loadLanguage(EN.language),
    "fr-FR": loadLanguage(FR.language),
    "es-ES": loadLanguage(ES.language),
};

// ---------- Route ----------
export async function GET() {
    const withMarkers = Object.entries(langs).map(([code, lang]) => ({
        code,
        ...lang,

        ui: lang.ui.map<UIField>((f) => {
            if (isUITextField(f)) {
                return {
                    ...f,
                    Text: f.Text + " [DB]",
                };
            }
            return f;
        }),

        routes: lang.routes.map((r) => ({
            ...r,
            fields: r.fields.map((f) => ({
                ...f,
                Text: f.Text + " [DB]",
            })),
        })),
    }));

    // Simulate latency
    await new Promise((res) => setTimeout(res, 500));

    return NextResponse.json(withMarkers);
}
