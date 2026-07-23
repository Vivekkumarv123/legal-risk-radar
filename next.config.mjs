/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    config.ignoreWarnings = [
      { module: /node_modules\/tesseract\.js/ },
    ];

    return config;
  },

  // ✅ NEW correct location
  serverExternalPackages: ['tesseract.js'],
};

export default nextConfig;
