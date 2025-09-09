"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLangStore } from "@/stores/langStore";

export default function Introduction() {
    const pathname = usePathname();
    const { i18nR } = useLangStore();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50">
            <h1 className="text-3xl font-bold">{i18nR(pathname, "s1_h1")}</h1>
            <p className="text-gray-700">{i18nR(pathname, "s1_p1")}</p>
            <Link href="/section1" className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
                {i18nR(pathname, "s1_b1")}
            </Link>
        </main>
    );
}
