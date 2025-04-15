import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are available at build time
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    BACKEND_API: process.env.BACKEND_API,
  },
  // Required for AWS Amplify
  output: "standalone", // or "export" if you're using static exports
};

export default nextConfig;
