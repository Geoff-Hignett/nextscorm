import { NextResponse } from "next/server";
import EN from "@/language/en.json";
import FR from "@/language/fr.json";
import ES from "@/language/es.json";
import type { Language } from "@/stores/langStore";

const langs: Record<string, Language> = {
    "en-GB": EN.language,
    "fr-FR": FR.language,
    "es-ES": ES.language,
};

export async function GET() {
    const withMarkers = Object.entries(langs).map(([code, lang]) => ({
        code,
        ...lang,
        ui: lang.ui.map((f) => ({ ...f, Text: f.Text + " [DB]" })),
        routes: lang.routes.map((r) => ({
            ...r,
            fields: r.fields.map((f) => ({ ...f, Text: f.Text + " [DB]" })),
        })),
    }));

    // Simulate latency
    await new Promise((res) => setTimeout(res, 500));

    return NextResponse.json(withMarkers);
}
