import { prismadb } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Session } from "next-auth";
import { Prisma } from "@prisma/client";

export abstract class CrudService<T> {
  protected session: Session | null = null;

  protected async initializeSession() {
    this.session = await getServerSession(authOptions);
    if (!this.session?.user?.email) {
      throw new Error("User not authenticated");
    }
  }

  async getCurrentUser() {
    await this.initializeSession();
    if (!this.session?.user?.email) {
      throw new Error("User not logged in");
    }
    
    const user = await prismadb.users.findUnique({
      where: { email: this.session.user.email },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async checkResourceAccess(resourceId: string, modelName: string, userId?: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    const currentUserId = userId || user.id;
    
    // Admins can access everything
    if (user.is_admin) {
      return true;
    }

    // For specific models, check ownership or assignment
    switch(modelName) {
      case 'crm_Contracts':
        const contract = await prismadb.crm_Contracts.findUnique({
          where: { id: resourceId },
        });
        return contract?.assigned_to === currentUserId || contract?.createdBy === currentUserId;
        
      case 'crm_Accounts':
        const account = await prismadb.crm_Accounts.findUnique({
          where: { id: resourceId },
        });
        return account?.assigned_to === currentUserId || account?.createdBy === currentUserId;
        
      case 'crm_Contacts':
        const contact = await prismadb.crm_Contacts.findUnique({
          where: { id: resourceId },
        });
        return contact?.assigned_to === currentUserId || contact?.createdBy === currentUserId;
        
      case 'crm_Opportunities':
        const opportunity = await prismadb.crm_Opportunities.findUnique({
          where: { id: resourceId },
        });
        return opportunity?.assigned_to === currentUserId || opportunity?.created_by === currentUserId;
        
      default:
        return false;
    }
  }

  async checkRelatedRecords(id: string, modelName: string): Promise<number> {
    // Check for related records that would prevent deletion
    switch(modelName) {
      case 'crm_Contracts':
        // Check if any tasks or documents are linked to this contract
        const relatedDocs = await prismadb.documentsToCrmAccountsTasks.count({
          where: {
            document_id: id // Simplified - actual relation may vary
          }
        });
        return relatedDocs;
        
      case 'crm_Accounts':
        // Check if any contacts, opportunities, or contracts are linked to this account
        const contacts = await prismadb.crm_Contacts.count({
          where: { account: id }
        });
        const opportunities = await prismadb.crm_Opportunities.count({
          where: { account: id }
        });
        const contracts = await prismadb.crm_Contracts.count({
          where: { account: id }
        });
        return contacts + opportunities + contracts;
        
      default:
        return 0;
    }
  }

  async create(data: any): Promise<T> {
    throw new Error("Method not implemented");
  }

  async findById(id: string): Promise<T | null> {
    throw new Error("Method not implemented");
  }

  async update(id: string, data: any, version?: number): Promise<T> {
    throw new Error("Method not implemented");
  }

  async delete(id: string): Promise<boolean> {
    throw new Error("Method not implemented");
  }
}

// Enhanced error handling utility
export class CrudError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, CrudError.prototype);
  }
}

// Specific error types
export class UnauthorizedError extends CrudError {
  constructor(message: string = "Unauthorized access") {
    super(message, "UNAUTHORIZED");
  }
}

export class ValidationError extends CrudError {
  constructor(message: string = "Validation failed") {
    super(message, "VALIDATION_ERROR");
  }
}

export class ForeignKeyConstraintError extends CrudError {
  constructor(message: string = "Cannot delete record due to foreign key constraints") {
    super(message, "FOREIGN_KEY_CONSTRAINT");
  }
}

export class OptimisticLockError extends CrudError {
  constructor(message: string = "Record was modified by another user") {
    super(message, "OPTIMISTIC_LOCK_ERROR");
  }
}

// Generic error mapper
export const mapPrismaError = (error: any): CrudError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2003': // Foreign key constraint violation
        return new ForeignKeyConstraintError("Cannot delete this record because it's referenced by other records.");
      case 'P2025': // Record does not exist
        return new CrudError("Record does not exist.", "RECORD_NOT_FOUND");
      case 'P2002': // Unique constraint violation
        return new ValidationError("A record with this data already exists.");
      default:
        return new CrudError("An error occurred during the operation.", "DATABASE_ERROR", error.message);
    }
  }
  return new CrudError("An unexpected error occurred.", "UNKNOWN_ERROR", error.message);
};