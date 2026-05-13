//@ts-nocheck
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
  console.log("🌱 Seeding system modules...");

  try {
    const modules = [
      {
        name: "crm",
        enabled: true,
        position: 1
      },
      {
        name: "marketing",
        enabled: true,
        position: 2
      },
      {
        name: "projects",
        enabled: true,
        position: 3
      },
      {
        name: "emails",
        enabled: true,
        position: 4
      },
      {
        name: "employee",
        enabled: true,
        position: 5
      },
      {
        name: "invoice",
        enabled: false,
        position: 6
      },
      {
        name: "reports",
        enabled: true,
        position: 7
      },
      {
        name: "documents",
        enabled: false,
        position: 8
      },
      {
        name: "databox",
        enabled: false,
        position: 9
      },
      {
        name: "openai",
        enabled: false,
        position: 10
      }
    ];

    for (const module of modules) {
      await prisma.system_Modules_Enabled.upsert({
        where: { name: module.name },
        update: {
          enabled: module.enabled,
          position: module.position,
          v: 0,
        },
        create: {
          name: module.name,
          enabled: module.enabled,
          position: module.position,
          v: 0,
        },
      });
    }

    console.log("✅ System modules seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding system modules:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
