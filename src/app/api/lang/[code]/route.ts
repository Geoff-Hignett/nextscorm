import { NextResponse } from "next/server";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";
import type { Language, UIField, UITextField } from "@/types/language";
import { loadLanguage } from "@/language/loadLanguage";

// ---------- Type guard ----------
// This is the key fix: it *proves* to TypeScript that Text exists
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
export async function GET(_req: Request, context: { params: Promise<{ code: string }> }) {
    const { code } = await context.params;
    const lang = langs[code];

    if (!lang) {
        return NextResponse.json({ error: `Language ${code} not found` }, { status: 404 });
    }

    const withMarker: Language = {
        ...lang,

        // ✅ UI transform (type-safe)
        ui: lang.ui.map<UIField>((f) => {
            if (isUITextField(f)) {
                return {
                    ...f,
                    Text: f.Text + " [DB]",
                };
            }
            return f;
        }),

        // ✅ Routes are already homogeneous
        routes: lang.routes.map((r) => ({
            ...r,
            fields: r.fields.map((f) => ({
                ...f,
                Text: f.Text + " [DB]",
            })),
        })),
    };

    // Simulated latency
    await new Promise((res) => setTimeout(res, 500));

    return NextResponse.json(withMarker);
}
