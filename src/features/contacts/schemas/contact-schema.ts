import { z } from "zod";

const PHONE_PATTERN = /^(?:\+92|0)3\d{9}$/;
const CNIC_PATTERN = /^\d{5}-?\d{7}-?\d$/;

// Mirrors CreateContactDto — messages are message-catalogue keys, resolved at render
export const contactSchema = z.object({
  name: z.string().min(2, "nameLength").max(150, "nameLength"),
  phone: z.string().regex(PHONE_PATTERN, "phoneInvalid"),
  email: z.email("emailInvalid").max(255, "emailLength").nullable(),
  cnic: z.string().regex(CNIC_PATTERN, "cnicInvalid").nullable(),
  address: z.string().max(500, "addressLength").nullable(),
  notes: z.string().max(2000, "notesLength").nullable(),
  status: z.boolean(),
});
