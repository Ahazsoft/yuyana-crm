"use server";

import { prismadb } from "@/lib/prisma";
import { DeleteContract } from "./schema";
import { InputType, ReturnType } from "./types";

import { createSafeAction } from "@/lib/create-safe-action";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkResourceAccess } from "@/lib/auth-guard";
import { mapPrismaError } from "@/lib/crud-service";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { error: "User not logged in." };
  }

  const user = await prismadb.users.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return { error: "User not found." };
  }

  const { id } = data;

  if (!id) {
    return { error: "Please provide a contract ID." };
  }

  // Check authorization
  const hasAccess = await checkResourceAccess(
    user.id,
    id,
    "crm_Contracts"
  );

  if (!hasAccess) {
    return {
      error: "You don't have permission to delete this contract.",
    };
  }

  try {
    await prismadb.crm_Contracts.delete({
      where: {
        id: id,
      },
    });

    return { data: { id } };
    
  } catch (error) {
    const mappedError = mapPrismaError(error);
    console.log(error);
    return {
      error: mappedError.message,
    };
  }
  
};

export const deleteContract = createSafeAction(DeleteContract, handler);

// "use server";

// import { prismadb } from "@/lib/prisma";
// import { DeleteContract } from "./schema";
// import { InputType, ReturnType } from "./types";

// import { createSafeAction } from "@/lib/create-safe-action";
// import { getServerSession, Session } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { checkResourceAccess } from "@/lib/auth-guard";
// import { mapPrismaError, ForeignKeyConstraintError } from "@/lib/crud-service";

// const handler = async (data: InputType): Promise<ReturnType> => {
//   const session: Session | null = await getServerSession(authOptions);

//   if (!session?.user?.email) {
//     return {
//       error: "User not logged in.",
//     };
//   }

//   const user = await prismadb.users.findUnique({
//     where: {
//       email: session?.user?.email,
//     },
//   });

//   if (!user) {
//     return {
//       error: "User not found.",
//     };
//   }

//   const { id } = data;

//   if (!id) {
//     return {
//       error: "Please provide a contract ID.",
//     };
//   }

//   // Check authorization
//   const hasAccess = await checkResourceAccess(user.id, id, 'crm_Contracts');
//   if (!hasAccess) {
//     return {
//       error: "You don't have permission to delete this contract.",
//     };
//   }

//   try {
//     // Check for related records that would prevent deletion
//     const relatedRecords = await checkRelatedRecords(id);
//     if (relatedRecords > 0) {
//       return {
//         error: `Cannot delete contract because it has ${relatedRecords} related records. Remove those first.`,
//       };
//     }

//     // Perform the deletion in a transaction
//     const result = await prismadb.$transaction(async (tx) => {
//       return await tx.crm_Contracts.delete({
//         where: {
//           id: id,
//         },
//       });
//     });
    
//     console.log(result, "Contract deleted successfully");
//   } catch (error) {
//     const mappedError = mapPrismaError(error);
//     console.log(error);
//     return {
//       error: mappedError.message,
//     };
//   }

//   return { data: { id } };
// };

// // Check for related records that would prevent deletion
// // const checkRelatedRecords = async (id: string): Promise<number> => {
// //   // Check if any tasks or documents are linked to this contract
// //   // This is a simplified check - adjust based on actual relations
// //   try {
// //     // Count related documents
// //     const docCount = await prismadb.documents.count({
// //       where: {
// //         document_system_type: 'CONTRACT',
// //         document_ref_id: id, // Assuming there's a reference field
// //       }
// //     });
    
// //     // Count related tasks
// //     const taskCount = await prismadb.tasks.count({
// //       where: {
// //         related_contract_id: id, // Assuming there's a related contract field
// //       }
// //     });
    
// //     return docCount + taskCount;
// //   } catch (error) {
// //     console.error("Error checking related records", error);
// //     // Return 0 to allow deletion if we can't check properly
// //     return 0;
// //   }
// // };
// const checkRelatedRecords = async (id: string): Promise<number> => {
//   try {
//     const [docCount, taskCount] = await Promise.all([
//       prismadb.documentsToContracts.count({
//         where: { contract_id: id },
//       }),
//       prismadb.crm_Accounts_Tasks.count({
//         where: { contract: id },
//       }),
//     ]);

//     return docCount + taskCount;
//   } catch (error) {
//     console.error("Error checking related records", error);
//     return 0;
//   }
// };

// export const deleteContract = createSafeAction(DeleteContract, handler);