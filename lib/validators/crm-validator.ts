import { z } from "zod";

export const BaseValidator = z.object({
  id: z.string().uuid().optional(),
});

export const ContractValidator = BaseValidator.extend({
  title: z.string().min(1, "Title is required").max(255),
  value: z.preprocess((val) => Number(val), z.number().positive("Value must be positive")),
  description: z.string().optional(),
  status: z.enum(['NOTSTARTED', 'INPROGRESS', 'SIGNED']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  account: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const AccountValidator = BaseValidator.extend({
  name: z.string().min(1, "Account name is required").max(255),
  email: z.string().email("Invalid email format").optional(),
  office_phone: z.string().optional(),
  industry: z.string().uuid().optional(),
  employees: z.string().optional(),
  annual_revenue: z.string().optional(),
  billing_city: z.string().optional(),
  billing_country: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
});

export const ContactValidator = BaseValidator.extend({
  first_name: z.string().min(1, "First name is required").max(255),
  last_name: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email format").optional(),
  office_phone: z.string().optional(),
  position: z.string().optional(),
  account: z.string().uuid().optional(),
  type: z.string().optional(),
  status: z.boolean().optional(),
});

export const OpportunityValidator = BaseValidator.extend({
  name: z.string().min(1, "Opportunity name is required").max(255),
  account: z.string().uuid().optional(),
  contact: z.string().uuid().optional(),
  campaign: z.string().uuid().optional(),
  sales_stage: z.string().uuid().optional(),
  type: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'CLOSED']).optional(),
  expected_revenue: z.number().nonnegative("Expected revenue must be non-negative").optional(),
  close_date: z.coerce.date().optional(),
  description: z.string().optional(),
  budget: z.number().nonnegative("Budget must be non-negative").optional(),
  currency: z.string().optional(),
});

// Reusable validation function
export const validateWithZod = <T extends z.ZodSchema<any>>(
  schema: T,
  data: any
): Promise<z.infer<T>> => {
  return schema.parseAsync(data);
};

// Validator for common fields
export const IdValidator = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export const VersionValidator = z.object({
  v: z.number().int("Version must be an integer"),
});

export const PaginatedRequestValidator = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});