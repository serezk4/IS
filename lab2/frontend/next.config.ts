import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: {
        appIsrStatus: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cataas.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
