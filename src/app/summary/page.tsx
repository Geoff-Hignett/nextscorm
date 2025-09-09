import Link from "next/link";

export default function Summary() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50">
            <h1 className="text-3xl font-bold">Summary</h1>
            <p className="text-gray-700">You’ve reached the end of the course</p>

            <div className="flex gap-4">
                <Link href="/" className="rounded bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300">
                    Back to Intro
                </Link>
                <Link href="/section1" className="rounded bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300">
                    Back to Section 1
                </Link>
            </div>
        </main>
    );
}
