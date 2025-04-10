import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure environment variables are available at build time
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  // Required for AWS Amplify
  output: "standalone", // or "export" if you're using static exports
};

export default nextConfig;
