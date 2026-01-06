import type { Language } from "@/stores/langTypes";

/**
 * Runtime validator / caster for language JSON.
 * Centralises the unsafe boundary at the JSON import.
 */
export function loadLanguage(json: unknown): Language {
    return json as Language;
}
