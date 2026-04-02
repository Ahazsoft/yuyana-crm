import { prismadb } from "./prisma";

/**
 * Checks if a user has access to a specific resource based on ownership or assignment
 * @param userId - The ID of the user requesting access
 * @param resourceId - The ID of the resource being accessed
 * @param modelName - The name of the model (table) containing the resource
 * @returns Promise<boolean> - True if the user has access, false otherwise
 */
export const checkResourceAccess = async (
  userId: string, 
  resourceId: string, 
  modelName: string
): Promise<boolean> => {
  if (!userId || !resourceId || !modelName) {
    return false;
  }

  try {
    // Admins can access everything
    const user = await prismadb.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    if (user.is_admin) {
      return true;
    }

    // For specific models, check ownership or assignment
    switch (modelName) {
      case 'crm_Contracts':
        const contract = await prismadb.crm_Contracts.findUnique({
          where: { id: resourceId },
        });
        return contract?.assigned_to === userId || contract?.createdBy === userId;

      case 'crm_Accounts':
        const account = await prismadb.crm_Accounts.findUnique({
          where: { id: resourceId },
        });
        return account?.assigned_to === userId || account?.createdBy === userId;

      case 'crm_Contacts':
        const contact = await prismadb.crm_Contacts.findUnique({
          where: { id: resourceId },
        });
        return contact?.assigned_to === userId || contact?.createdBy === userId;

      case 'crm_Opportunities':
        const opportunity = await prismadb.crm_Opportunities.findUnique({
          where: { id: resourceId },
        });
        return opportunity?.assigned_to === userId || opportunity?.created_by === userId;

      case 'crm_Leads':
        const lead = await prismadb.crm_Leads.findUnique({
          where: { id: resourceId },
        });
        return lead?.assigned_to === userId || lead?.createdBy === userId;

      case 'Documents':
        const document = await prismadb.documents.findUnique({
          where: { id: resourceId },
        });
        return document?.assigned_user === userId || document?.created_by_user === userId;

      case 'Invoices':
        const invoice = await prismadb.invoices.findUnique({
          where: { id: resourceId },
        });
        return invoice?.assigned_user_id === userId || invoice?.created_by_user_id === userId;

      case 'Tasks':
        const task = await prismadb.tasks.findUnique({
          where: { id: resourceId },
        });
        return task?.assigned_user === userId || task?.createdBy === userId;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking resource access for model ${modelName}`, error);
    return false;
  }
};

/**
 * Checks if a user has admin privileges
 * @param userId - The ID of the user to check
 * @returns Promise<boolean> - True if the user is an admin, false otherwise
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  try {
    const user = await prismadb.users.findUnique({
      where: { id: userId },
    });

    return !!user?.is_admin;
  } catch (error) {
    console.error('Error checking admin status', error);
    return false;
  }
};

/**
 * Checks if a user has account admin privileges
 * @param userId - The ID of the user to check
 * @returns Promise<boolean> - True if the user is an account admin, false otherwise
 */
export const isAccountAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  try {
    const user = await prismadb.users.findUnique({
      where: { id: userId },
    });

    return !!user?.is_account_admin;
  } catch (error) {
    console.error('Error checking account admin status', error);
    return false;
  }
};