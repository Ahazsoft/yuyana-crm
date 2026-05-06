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
    startDate,
    endDate,
    renewalReminderDate,
    customerSignedDate,
    companySignedDate,
    description,
    status,
    account,
    contact,
    assigned_to,
  } = data;

  if (!id) {
    return {
      error: "No contract ID provided.",
    };
  }

  if (!title) {
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
      const currentContract = await tx.crm_Contracts.findUnique({ where: { id } });

      if (!currentContract) {
        throw new Error("Contract not found");
      }

      // Check if the version matches (optimistic locking)
      if (currentContract.v !== v) {
        throw new OptimisticLockError();
      }

      // Build update payload depending on contract type
      const updatePayload: any = {
        v: data.v + 1,
        title,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        renewalReminderDate: renewalReminderDate || undefined,
        customerSignedDate: customerSignedDate || undefined,
        companySignedDate: companySignedDate || undefined,
        description: description || undefined,
        // status is now a string field in schema
        status: status || undefined,
        updatedBy: user.id,
      };

      // If existing contract is customer-type, only allow contact updates
      if (currentContract.type === "customer") {
        //@ts-ignore
        updatePayload.contact = contact || currentContract.contact || undefined;
        // ensure account is not set
        updatePayload.account = undefined;
      } else if (currentContract.type === "company") {
        updatePayload.account = account || currentContract.account || undefined;
        updatePayload.contact = undefined;
      } else {
        // If no type set, use provided values preferentially
        updatePayload.contact = contact || undefined;
        updatePayload.account = account || undefined;
      }

      // assigned_to stored as scalar
      if (assigned_to) updatePayload.assigned_to = assigned_to;

      // Use updateMany for optimistic locking (match id + v)
      const updated = await tx.crm_Contracts.updateMany({
        where: { id, v },
        data: updatePayload,
      });

      if (updated.count === 0) {
        throw new OptimisticLockError();
      }

      return true;
    });

    // result isn't used beyond success
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