import { z } from "zod";

export const CreateNewContract = z.object({
  title: z.string().min(3).max(255),
  value: z.string().nullable().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  renewalReminderDate: z.date().optional(),
  customerSignedDate: z.date().optional().nullable(),
  companySignedDate: z.date().optional().nullable(),
  description: z.string().max(255),
  account: z.string().optional().nullable(),
  assigned_to: z.string().optional(),
});
