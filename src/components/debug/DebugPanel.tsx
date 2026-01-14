"use client";

import { useDebugStore } from "@/stores/debugStore";
import { useScormStore } from "@/stores/scormStore";
import { isDebugEnabled } from "@/lib/infra/env";

function Row({ label, value, source }: { label: string; value: React.ReactNode; source?: "LMS" | "Local" }) {
    return (
        <div className="grid grid-cols-2 gap-2 py-0.5">
            <span className="text-gray-500">{label}</span>
            <span className="font-mono text-gray-900">
                {value ?? "—"}
                {source && <span className="ml-2 text-xs text-gray-500">({source})</span>}
            </span>
        </div>
    );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="px-3 py-1.5 rounded bg-gray-800 text-white text-xs hover:bg-gray-700">
            {label}
        </button>
    );
}

export default function DebugPanel() {
    const { visible, events, clear } = useDebugStore();
    const scorm = useScormStore();

    if (!isDebugEnabled || !visible) return null;

    const source: "LMS" | "Local" = scorm.scormAPIConnected ? "LMS" : "Local";

    return (
        <div className="fixed inset-4 z-[9998] bg-white rounded-xl shadow-2xl flex flex-col">
            {/* Header */}
            <header className="flex justify-between px-4 py-2 bg-gray-900 text-white">
                <span className="font-semibold">Debug Panel</span>
                <button onClick={clear} className="text-sm underline">
                    Clear logs
                </button>
            </header>

            {/* Persistence snapshot */}
            <section className="px-4 py-3 border-b text-sm">
                <h3 className="font-semibold mb-2">Persistence</h3>

                <Row label="Active target" value={source === "LMS" ? "LMS (SCORM)" : "LocalStorage"} />

                <Row label="Suspend data" value={scorm.suspendData ? `${scorm.suspendData.length} chars` : "—"} source={source} />

                <Row label="Location" value={scorm.location ?? "—"} source={source} />
            </section>

            {/* Actions */}
            <section className="px-4 py-3 border-b text-sm">
                <h3 className="font-semibold mb-2">SCORM Actions</h3>

                <div className="space-y-3">
                    {/* Progress */}
                    <div>
                        <div className="text-gray-500 text-xs mb-1">Progress</div>
                        <div className="flex flex-wrap gap-2">
                            <ActionButton
                                label="Set suspend data → {foo:'bar'}"
                                onClick={() =>
                                    scorm.scormSetSuspendData({
                                        foo: "bar",
                                        location: 1,
                                    })
                                }
                            />
                            <ActionButton label="Set location → 1" onClick={() => scorm.scormSetLocation(1)} />
                            <ActionButton label="Set score → 50" onClick={() => scorm.scormSetScore(50)} />
                            <ActionButton label="Mark complete" onClick={scorm.scormSetComplete} />
                        </div>
                    </div>

                    {/* Objectives */}
                    <div>
                        <div className="text-gray-500 text-xs mb-1">Objectives</div>
                        <div className="flex flex-wrap gap-2">
                            <ActionButton label="Init objectives" onClick={scorm.scormInitObjectives} />
                            <ActionButton label="Set objective 0 score → 50" onClick={() => scorm.scormSetObjectiveScore(0, 50)} />
                            {scorm.version === "2004" && (
                                <ActionButton label="Set objective 0 progress → 50%" onClick={() => scorm.scormSetObjectiveProgress(0, 50)} />
                            )}
                        </div>
                    </div>

                    {/* Lifecycle */}
                    <div>
                        <div className="text-gray-500 text-xs mb-1">Lifecycle</div>
                        <div className="flex flex-wrap gap-2">
                            <ActionButton label="Reconnect" onClick={scorm.scormConnect} />
                            <ActionButton label="Terminate" onClick={scorm.scormTerminate} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Logs */}
            <section className="flex-1 overflow-auto px-4 py-2 font-mono text-xs bg-gray-50">
                {events.length === 0 ? (
                    <div className="text-gray-400">No logs yet</div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="mb-2">
                            <div className={event.level === "error" ? "text-red-600" : event.level === "warn" ? "text-yellow-700" : "text-gray-800"}>
                                [{new Date(event.timestamp).toLocaleTimeString()}] {event.message}
                            </div>

                            {event.payload !== undefined && <pre className="ml-2 mt-1 text-gray-500">{JSON.stringify(event.payload, null, 2)}</pre>}
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
