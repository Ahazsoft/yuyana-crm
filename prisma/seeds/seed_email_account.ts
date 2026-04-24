import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding EmailAccount records...");

  // Find example users (created by other seed scripts)
  const admin = await prisma.users.findFirst({ where: { email: "admin@test.com" } });
  const normal = await prisma.users.findFirst({ where: { email: "user@test.com" } });

  // Example EmailAccount for admin
  if (admin) {
    const existing = await prisma.emailAccount.findFirst({ where: { user: admin.id } });
    if (!existing) {
      await prisma.emailAccount.create({
        data: {
          v: 0,
          user: admin.id,
          email: "admin@test.com",
          host: process.env.IMAP_HOST || "imap.example.com",
          port: process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993,
          secure: typeof process.env.IMAP_SECURE !== "undefined" ? process.env.IMAP_SECURE === "true" : true,
          password: process.env.IMAP_PASSWORD || "example-password",
          mailbox: process.env.IMAP_MAILBOX || "INBOX",
          sentMailbox: process.env.IMAP_SENT_MAILBOX || "Sent",
        },
      });
      console.log("  • Created EmailAccount for admin");
    } else {
      console.log("  • EmailAccount for admin already exists");
    }
  }

  // Example EmailAccount for normal user
  if (normal) {
    const existing = await prisma.emailAccount.findFirst({ where: { user: normal.id } });
    if (!existing) {
      await prisma.emailAccount.create({
        data: {
          v: 0,
          user: normal.id,
          email: "user@test.com",
          host: process.env.IMAP_HOST || "imap.example.com",
          port: process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993,
          secure: typeof process.env.IMAP_SECURE !== "undefined" ? process.env.IMAP_SECURE === "true" : true,
          password: process.env.IMAP_PASSWORD || "example-password",
          mailbox: process.env.IMAP_MAILBOX || "INBOX",
          sentMailbox: process.env.IMAP_SENT_MAILBOX || "Sent",
        },
      });
      console.log("  • Created EmailAccount for normal user");
    } else {
      console.log("  • EmailAccount for normal user already exists");
    }
  }

  console.log("✅ EmailAccount seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
