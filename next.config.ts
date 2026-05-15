import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.rappler.com" },
      { protocol: "https", hostname: "**.gmanetwork.com" },
    ],
  },
};

export default nextConfig;
