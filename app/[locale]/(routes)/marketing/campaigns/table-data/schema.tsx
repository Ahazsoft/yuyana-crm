import { z } from "zod";

// Simple marketing campaign schema matching `crm_marketing_campaigns` model
export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.union([z.string(), z.instanceof(Date)]).optional(),
  endDate: z.union([z.string(), z.instanceof(Date)]).optional(),
  budget: z.number().nullable().optional(),
  spent: z.number().nullable().optional(),
  targetAudience: z.any().optional(),
  emailSubject: z.any().nullable().optional(),
  // `emailContent` is stored as JSON in the database and may be a string or an object.
  // Accept either a string or any JSON-compatible value here.
  emailContent: z.any().nullable().optional(),
  templateId: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.instanceof(Date)]).optional(),
  createdById: z.string().optional(),
  sentCount: z.number().optional(),
  openCount: z.number().optional(),
  clickCount: z.number().optional(),
  conversionCount: z.number().optional(),
});


export type Campaign = z.infer<typeof campaignSchema>;
