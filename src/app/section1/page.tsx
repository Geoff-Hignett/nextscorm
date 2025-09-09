import Link from "next/link";

export default function Section1() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50">
            <h1 className="text-3xl font-bold">Section 1</h1>
            <p className="text-gray-700">Core learning content goes here.</p>

            <div className="flex gap-4">
                <Link href="/" className="rounded bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300">
                    Back to Intro
                </Link>
                <Link href="/summary" className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
                    Go to Summary
                </Link>
            </div>
        </main>
    );
}
