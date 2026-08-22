import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/alerts', destination: '/safety/emergency', permanent: true },
      { source: '/command-center', destination: '/safety/command-center', permanent: true },
      { source: '/communication', destination: '/announcements', permanent: true },
      { source: '/parent-portal', destination: '/parent', permanent: true },
      { source: '/placements', destination: '/placement', permanent: true },
      { source: '/sos', destination: '/safety/sos', permanent: true },
      { source: '/safety-analytics', destination: '/analytics/safety', permanent: true },
    ];
  },
};

export default nextConfig;
