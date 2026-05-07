import { email, z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
// export const opportunitySchema = z.object({
//   //TODO: fix all the types and nullable
//   id: z.string(),
//   first_name: z.string().nullable(),
//   last_name: z.string(),
//   email: z.string().nullable(),
//   personal_email: z.string().nullable(),
//   office_phone: z.string().nullable(),
//   mobile_phone: z.string().nullable(),
//   website: z.string().nullable(),
//   position: z.string().nullable(),
//   status: z.boolean(),

//   type: z.string().nullable(),
// });

// export type Opportunity = z.infer<typeof opportunitySchema>;

export const userRoleEnum = z.enum(["ADMIN", "SALES", "MARKETING"]);
export type UserRole = z.infer<typeof userRoleEnum>;

export const userStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export type UserStatus = z.infer<typeof userStatusEnum>;

export const EmployeeSchema = z.object({
  id:z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  role: userRoleEnum,
  personalEmail: z.string().email("Invalid email address").nullable().optional(),
  userStatus: userStatusEnum.optional(),
});
export type Employee = z.infer<typeof EmployeeSchema>;
