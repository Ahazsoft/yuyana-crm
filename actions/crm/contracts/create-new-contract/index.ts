"use server";

import { prismadb } from "@/lib/prisma";
import { CreateNewContract } from "./schema";
import { InputType, ReturnType } from "./types";

import { createSafeAction } from "@/lib/create-safe-action";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "User not logged in." };
  }

  const user = await prismadb.users.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: "User not found." };
  }

  const {
    title,
    type,
    value,
    startDate,
    endDate,
    renewalReminderDate,
    customerSignedDate,
    companySignedDate,
    description,
    account,
    contact,
    assigned_to,
    // status,
  } = data;

  if (!title) {
    return { error: "Please fill in all the required fields." };
  }

  // enforce server-side requirement consistent with frontend rules
  if (type === "customer" && !contact) {
    return { error: "Customer contract requires a contact selection." };
  }
  if (type === "company" && !account) {
    return { error: "Company contract requires an account selection." };
  }

  try {
    const createData: any = {
      v: 0,
      title,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      renewalReminderDate: renewalReminderDate || undefined,
      customerSignedDate: customerSignedDate || undefined,
      companySignedDate: companySignedDate || undefined,
      description: description || undefined,
      type: type || undefined,
      // scalars for relations (schema now includes `account` and `contact`)
      account: type === "company" ? account || undefined : undefined,
      contact: type === "customer" ? contact || undefined : undefined,
      assigned_to: assigned_to || undefined,
      status: "NOTSTARTED",
      createdBy: user.id,
    };

    if (value) {
      // ensure numeric if provided
      createData.value = Number(value);
    }

    await prismadb.crm_Contracts.create({ data: createData });
  } catch (error) {
    console.error("CreateNewContract error:", error);
    return {
      error:
        "Something went wrong while trying to create the contract. Please try again.",
    };
  }

  return { data: { title } };
};

export const createNewContract = createSafeAction(CreateNewContract, handler);
