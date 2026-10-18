import { z } from "zod";

const PHONE_PATTERN = /^(?:\+92|0)3\d{9}$/;

// Mirrors CreateCompanyDto — messages are message-catalogue keys, resolved at render
export const companySchema = z.object({
  name: z.string().min(2, "nameLength").max(255, "nameLength"),
  email: z.email("emailInvalid").max(255, "emailLength").optional(),
  phone: z.string().regex(PHONE_PATTERN, "phoneInvalid").optional(),
  address: z.string().max(500, "addressLength").optional(),
  city: z.string().max(100, "cityLength").optional(),
  status: z.boolean(),
  voiceAssistantEnabled: z.boolean(),
});
