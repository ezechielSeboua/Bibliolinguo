import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sharp n'est pas installé en dev — on désactive l'optimisation pour les assets locaux
    unoptimized: true,
  },
};

export default nextConfig;
