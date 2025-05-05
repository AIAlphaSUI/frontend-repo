// /** @type {import('next').NextConfig} */ const nextConfig = {};

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Handle WebSocket dependencies
    config.externals = [
      ...(config.externals || []),
      {
        "utf-8-validate": "commonjs utf-8-validate",
        bufferutil: "commonjs bufferutil",
      },
    ];
    return config;
  },
};

module.exports = nextConfig;
