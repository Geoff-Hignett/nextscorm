"use client";

import { useDebugStore } from "@/stores/debugStore";
import { isDebugEnabled } from "@/infra/env";

export default function DebugToggle() {
    const toggleVisible = useDebugStore((s) => s.toggleVisible);

    if (!isDebugEnabled) return null;

    return (
        <button
            onClick={toggleVisible}
            className="fixed bottom-4 right-4 z-[9999]
                       rounded-full bg-black text-white
                       w-12 h-12 flex items-center justify-center
                       shadow-lg hover:bg-gray-800">
            🛠
        </button>
    );
}
