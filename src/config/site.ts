export const siteConfig = {
  name: process.env.NEXT_PUBLIC_COMPANY_SHOT_NAME ?? "RMS",
  description: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Rent Management System",
  poweredBy: "Powered by MIFA Alliance",
  contactNumber: "0329 6789539",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1",
  apiTimeoutMs: 15_000,
} as const;
