"use client";

import { useEffect } from "react";
import { useScormStore } from "@/stores/scormStore";

type Props = {
    children: React.ReactNode;
};

export default function ScormWrapper({ children }: Props) {
    const scorm = useScormStore();

    useEffect(() => {
        scorm.hydrateFromPersistence();
        scorm.scormConnect();

        return () => {
            scorm.scormTerminate();
        };
        // scorm is a stable store reference; lifecycle should run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}
