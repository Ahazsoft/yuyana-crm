import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const leadSchema = z.object({
  //TODO: fix all the types and nullable
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastName: z.string().optional().nullable(),
  firstName: z.string().min(3).max(30).nonempty(),
  isArchived:z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;
