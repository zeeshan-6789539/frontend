export const siteConfig = {
  name: process.env.NEXT_PUBLIC_COMPANY_SHOT_NAME ?? "RMS",
  description: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Property Dealer Management System",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1",
  apiTimeoutMs: 15_000,
} as const;
