"use client";

import { useEffect } from "react";
import { useScormStore } from "@/stores/scormStore";

type Props = {
    children: React.ReactNode;
};

export default function ScormWrapper({ children }: Props) {
    const scorm = useScormStore();

    useEffect(() => {
        scorm.scormConnect();

        return () => {
            scorm.scormTerminate();
        };
    }, []);

    return <>{children}</>;
}
