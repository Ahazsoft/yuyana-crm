"use server";

import { prismadb } from "@/lib/prisma";
import { AccountValidator } from "@/lib/validators/crm-validator";
import { validateWithZod } from "@/lib/validators/crm-validator";
import { createSafeAction } from "@/lib/create-safe-action";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkResourceAccess } from "@/lib/auth-guard";
import { mapPrismaError, OptimisticLockError } from "@/lib/crud-service";

interface InputType {
  id: string;
  v: number;
  name: string;
  email?: string;
  office_phone?: string;
  industry?: string;
  employees?: string;
  annual_revenue?: string;
  billing_city?: string;
  billing_country?: string;
  status?: string;
  type?: string;
  description?: string;
}

interface ReturnType {
  error?: string;
  data?: {
    name: string;
  };
}

const handler = async (data: InputType): Promise<ReturnType> => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      error: "User not logged in.",
    };
  }

  const user = await prismadb.users.findUnique({
    where: {
      email: session?.user?.email,
    },
  });

  if (!user) {
    return {
      error: "User not found.",
    };
  }

  const { id, v, name, email, office_phone, industry, employees, annual_revenue, 
         billing_city, billing_country, status, type, description } = data;

  if (!id) {
    return {
      error: "No account ID provided.",
    };
  }

  if (!name) {
    return {
      error: "Account name is required.",
    };
  }

  // Check authorization
  const hasAccess = await checkResourceAccess(user.id, id, 'crm_Accounts');
  if (!hasAccess) {
    return {
      error: "You don't have permission to update this account.",
    };
  }

  try {
    const result = await prismadb.$transaction(async (tx) => {
      // First, fetch the current record to check the version
      const currentAccount = await tx.crm_Accounts.findUnique({
        where: { id },
      });

      if (!currentAccount) {
        throw new Error("Account not found");
      }

      // Check if the version matches (optimistic locking)
      if (currentAccount.v !== v) {
        throw new OptimisticLockError();
      }

      // Perform the update with incremented version
      return await tx.crm_Accounts.update({
        where: {
          id: data.id,
          v: data.v, // Include version in WHERE clause for optimistic locking
        },
        data: {
          v: data.v + 1, // Increment version
          name,
          email: email || undefined,
          office_phone: office_phone || undefined,
          industry: industry || undefined,
          employees: employees || undefined,
          annual_revenue: annual_revenue || undefined,
          billing_city: billing_city || undefined,
          billing_country: billing_country || undefined,
          status: status || undefined,
          type: type || undefined,
          description: description || undefined,
          updatedBy: user.id,
        },
      });
    });

    //console.log("Result: ", result);
  } catch (error) {
    if (error instanceof OptimisticLockError) {
      return {
        error: error.message,
      };
    }
    
    const mappedError = mapPrismaError(error);
    console.log(mappedError);
    return {
      error: mappedError.message,
    };
  }

  return { data: { name } };
};

// Define a Zod schema for the input validation
const UpdateAccountSchema = AccountValidator.extend({
  v: z.number().int().min(0, "Version must be a non-negative integer"),
});

export const updateAccount = createSafeAction(UpdateAccountSchema, handler);