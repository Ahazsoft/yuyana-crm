import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    isAdmin: boolean;
    role?: "ADMIN" | "SALES" | "MARKETING";
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      _id: UserId;
      avatar?: string | null | undefined;
      isAdmin: boolean;
      role?: "ADMIN" | "SALES" | "MARKETING";
      userLanguage: string;
      userStatus: string;
    };
  }
}
