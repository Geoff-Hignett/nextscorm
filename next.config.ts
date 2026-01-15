import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export", // required for SCORM
    trailingSlash: true, // avoids LMS routing issues
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
