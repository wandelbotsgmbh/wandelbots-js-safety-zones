/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: This config file is evaluated at build time, not server runtime.
  // Any env variables used in here will not change after the build is complete.
  output: "standalone",

  // This somewhat cursed construction works around the lack of runtime env
  // variables; see entrypoint.sh
  basePath:
    process.env.NODE_ENV === "production"
      ? "/__REPLACE_ME_BASE_PATH__"
      : process.env.BASE_PATH || "",
  reactStrictMode: false,

  // Little dev niceness thing, redirect from / to base path
  redirects() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/",
            destination: process.env.BASE_PATH,
            basePath: false,
            permanent: false,
          },
        ]
      : []
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
      "*.ws": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.glb": {
        loaders: ["file-loader"],
        as: "*.js",
      },
    },
  },
  // We already check this stuff in a separate pipeline step
  // so we don't want the nextjs build to do it
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
