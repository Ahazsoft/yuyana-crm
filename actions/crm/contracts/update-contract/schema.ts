import { z } from "zod";


export const UpdateContract = z.object({
  id: z.string(),
  v: z.number(),
  title: z.string().min(3).max(255),
  value: z.string().nullable().optional(),
  startDate: z.date(),
  endDate: z.date(),
  renewalReminderDate: z.date().optional(),
  customerSignedDate: z.date().optional(),
  companySignedDate: z.date().optional(),
  description: z.string().max(255).optional(),
  status: z.string(),
  account: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  assigned_to: z.string(),
});
