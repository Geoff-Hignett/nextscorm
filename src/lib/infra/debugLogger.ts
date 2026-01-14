import { useDebugStore } from "@/stores/debugStore";
import type { DebugLevel, DebugSource } from "@/stores/debugStore";

/**
 * Lightweight debug logger used by stores and services.
 * Safe to call anywhere. No-op when debug is disabled.
 */
export function debugLog(level: DebugLevel, source: DebugSource, message: string, payload?: unknown) {
    const store = useDebugStore.getState();

    if (!store.enabled) return;

    store.log({
        level,
        source,
        message,
        payload,
    });
}
