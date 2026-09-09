import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Las fotos de producto pueden venir de Cloudinary (res.cloudinary.com)
    // o de URLs externas pegadas a mano en el admin (dominios impredecibles).
    // Se permite cualquier host HTTPS para que next/image no rompa ninguna
    // imagen existente. Son imágenes públicas de producto, sin riesgo relevante.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
