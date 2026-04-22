"use server";

import { prismadb } from "@/lib/prisma";
import { UpdateContract } from "./schema";
import { InputType, ReturnType } from "./types";

import { createSafeAction } from "@/lib/create-safe-action";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkResourceAccess } from "@/lib/auth-guard"; // Need to create this
import { mapPrismaError, OptimisticLockError } from "@/lib/crud-service";

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

  const {
    id,
    v,
    title,
    value,
    startDate,
    endDate,
    renewalReminderDate,
    customerSignedDate,
    companySignedDate,
    description,
    status,
    account,
    assigned_to,
  } = data;

  if (!id) {
    return {
      error: "No contract ID provided.",
    };
  }

  if (!title || !value) {
    return {
      error: "Please fill in all the required fields.",
    };
  }

  // Check authorization
  const hasAccess = await checkResourceAccess(user.id, id, 'crm_Contracts');
  if (!hasAccess) {
    return {
      error: "You don't have permission to update this contract.",
    };
  }

  try {
    const result = await prismadb.$transaction(async (tx) => {
      // First, fetch the current record to check the version
      const currentContract = await tx.crm_Contracts.findUnique({
        where: { id },
      });

      if (!currentContract) {
        throw new Error("Contract not found");
      }

      // Check if the version matches (optimistic locking)
      if (currentContract.v !== v) {
        throw new OptimisticLockError();
      }

      // Perform the update with incremented version
      return await tx.crm_Contracts.update({
        where: {
          id: data.id,
          v: data.v, // Include version in WHERE clause for optimistic locking
        },
        data: {
          v: data.v + 1, // Increment version
          title,
          value: parseFloat(value),
          startDate,
          endDate,
          renewalReminderDate,
          customerSignedDate,
          companySignedDate,
          description,
          status,
          account: account || undefined,
          assigned_to: assigned_to || undefined,
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

  return { data: { title } };
};

export const updateContract = createSafeAction(UpdateContract, handler);