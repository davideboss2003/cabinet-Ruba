/** @type {import('next').NextConfig} */
// Numele repo-ului de pe GitHub (apare in link: https://USERNAME.github.io/cabinet-Ruba/)
const repo = 'cabinet-Ruba';

const nextConfig = {
  output: "export",
  // Doar pentru testul de pe telefon in reteaua de acasa (npm run dev)
  allowedDevOrigins: ['192.168.1.135'],
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  env: {
    NEXT_PUBLIC_BASE_PATH: `/${repo}`,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
