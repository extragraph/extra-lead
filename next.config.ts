import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
  /**
   * Sans ceci, le bundle serverless Vercel ne contient pas `node_modules/@sparticuz/chromium/bin`
   * (fichiers .br) → erreur « The input directory …/chromium/bin does not exist ».
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output#outputfiletracingincludes
   */
  outputFileTracingIncludes: {
    "/api/screenshot": ["./node_modules/@sparticuz/chromium/**/*"],
  },
};

export default nextConfig;
