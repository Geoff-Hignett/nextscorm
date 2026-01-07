"use client";

import { useEffect } from "react";
import { useLangStore } from "@/stores/langStore";
import LangSelector from "@/components/lang/LangSelector";

export default function LangWrapper({ children }: { children: React.ReactNode }) {
    const { loadLang, activeLang, isLoading, mode } = useLangStore();

    useEffect(() => {
        if (mode !== "local") {
            loadLang(); // only fetch in API mode
        }
    }, [mode, loadLang]);

    if (isLoading || !activeLang) {
        return <div className="p-6 text-center">Loading language…</div>;
    }

    return (
        <>
            <header className="absolute top-0 left-0 w-full flex justify-end p-4">
                <LangSelector />
            </header>
            <main>{children}</main>
        </>
    );
}
