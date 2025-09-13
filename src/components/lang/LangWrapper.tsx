"use client";

import { useEffect } from "react";
import { useLangStore } from "@/stores/langStore";
import LangSelector from "@/components/lang/LangSelector";

export default function LangWrapper({ children }: { children: React.ReactNode }) {
    const { loadLang } = useLangStore();

    useEffect(() => {
        loadLang(); // load default language
    }, [loadLang]);

    return (
        <>
            <header className="flex justify-end p-4 border-b">
                <LangSelector />
            </header>
            <main>{children}</main>
        </>
    );
}
