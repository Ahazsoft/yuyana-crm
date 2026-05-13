import { cache } from "react";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getLeads = cache(async () => {
  const data = await prismadb.crm_Leads.findMany({
    include: {
      // Include assigned user (uses "LeadAssignedTo" relation)
      assigned_to_user: {
        select: {
          name: true,
        },
      },
      // Include assigned accounts
      assigned_accounts: true,
      // Include documents through DocumentsToLeads junction table
      documents: {
        include: {
          document: {
            select: {
              id: true,
              document_name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where:{
      isArchived: 'active'
    }
  });
  return data;
});

export const getArchivedLeads = cache(async () => {
  const data = await prismadb.crm_Leads.findMany({
    include: {
      assigned_to_user: {
        select: {
          name: true,
        },
      },
      // Include assigned accounts
      assigned_accounts: true,
      // Include documents through DocumentsToLeads junction table
      documents: {
        include: {
          document: {
            select: {
              id: true,
              document_name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where:{
      isArchived: 'archived'
    }
  });
  return data;
});

export const getMyOwnLeads = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return [];
  }
  const data = await prismadb.crm_Leads.findMany({
    include: {
      assigned_to_user: {
        select: {
          name: true,          
        },
      },
      assigned_accounts: true,    
    },
    orderBy: {
      createdAt: "desc",
    },
    where:{
      createdBy: session.user.id,
    }
  });
  return data;
});


export const getMyOwnArchivedLeads = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return [];
  }
  const data = await prismadb.crm_Leads.findMany({
    include: {
      assigned_to_user: {
        select: {
          name: true,          
        },
      },
      assigned_accounts: true,    
    },
    orderBy: {
      createdAt: "desc",
    },
    where:{
      createdBy: session.user.id,
      isArchived: 'archived'
    }
  });
  return data;
});