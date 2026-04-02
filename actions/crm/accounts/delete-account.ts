"use server";

import { prismadb } from "@/lib/prisma";
import { IdValidator } from "@/lib/validators/crm-validator";
import { createSafeAction } from "@/lib/create-safe-action";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkResourceAccess } from "@/lib/auth-guard";
import { mapPrismaError, ForeignKeyConstraintError } from "@/lib/crud-service";

interface InputType {
  id: string;
}

interface ReturnType {
  error?: string;
  data?: {
    id: string;
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

  const { id } = data;

  if (!id) {
    return {
      error: "Please provide an account ID.",
    };
  }

  // Check authorization
  const hasAccess = await checkResourceAccess(user.id, id, 'crm_Accounts');
  if (!hasAccess) {
    return {
      error: "You don't have permission to delete this account.",
    };
  }

  try {
    // Check for related records that would prevent deletion
    const relatedRecords = await checkRelatedRecords(id);
    if (relatedRecords > 0) {
      return {
        error: `Cannot delete account because it has ${relatedRecords} related records (contacts, opportunities, contracts). Remove those first.`,
      };
    }

    // Perform the deletion in a transaction
    const result = await prismadb.$transaction(async (tx) => {
      return await tx.crm_Accounts.delete({
        where: {
          id: id,
        },
      });
    });
    
    console.log(result, "Account deleted successfully");
  } catch (error) {
    const mappedError = mapPrismaError(error);
    console.log(error);
    return {
      error: mappedError.message,
    };
  }

  return { data: { id } };
};

// Check for related records that would prevent deletion
const checkRelatedRecords = async (id: string): Promise<number> => {
  try {
    // Count related contacts
    const contactCount = await prismadb.crm_Contacts.count({
      where: { account: id }
    });
    
    // Count related opportunities
    const opportunityCount = await prismadb.crm_Opportunities.count({
      where: { account: id }
    });
    
    // Count related contracts
    const contractCount = await prismadb.crm_Contracts.count({
      where: { account: id }
    });
    
    return contactCount + opportunityCount + contractCount;
  } catch (error) {
    console.error("Error checking related records", error);
    // Return 0 to allow deletion if we can't check properly
    return 0;
  }
};

export const deleteAccount = createSafeAction(IdValidator, handler);