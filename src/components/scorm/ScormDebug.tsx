"use client";

import { useScormStore } from "@/stores/scormStore";

export default function ScormDebug() {
    const scorm = useScormStore();

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-red-300 rounded-2xl">
            <div className="flex items-center mb-4 gap-4">
                <h2 className="font-bold text-xl">SCORM Test</h2>
                <h2>
                    Project currently set to <span className="font-bold text-red-600">SCORM {scorm.version || "—"}</span>
                </h2>
            </div>

            {/* --- Basic Getters --- */}
            <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={scorm.scormGetLocation} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Get Location
                </button>
                <button onClick={scorm.scormGetScore} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Get Score
                </button>
                <button onClick={scorm.scormGetStudentName} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Get Student Name
                </button>
                <button onClick={scorm.scormGetStudentID} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Get Student ID
                </button>
                <button onClick={scorm.scormGetSuspendData} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Get Suspend Data
                </button>
            </div>

            {/* --- Setters --- */}
            <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={() => scorm.scormSetLocation(1)} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Set Location 1
                </button>
                <button onClick={() => scorm.scormSetScore(50)} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Set Score 50
                </button>
                <button onClick={scorm.scormSetComplete} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Set Complete
                </button>
                <button onClick={scorm.scormTerminate} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Quit
                </button>
            </div>

            {/* --- Objectives --- */}
            <div className="flex items-center mb-4 gap-2">
                <h2 className="font-bold text-xl">SCORM Objectives</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={scorm.scormInitObjectives} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Init Objectives
                </button>
                <button onClick={() => scorm.scormSetObjectiveScore(0, 50)} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                    Set Objective 1 Score 50
                </button>
                {scorm.version === "2004" && (
                    <button onClick={() => scorm.scormSetObjectiveProgress(0, 50)} className="bg-sky-500 text-white text-lg px-4 py-2 rounded">
                        Set Objective 1 Progress 50%
                    </button>
                )}
            </div>
        </div>
    );
}
