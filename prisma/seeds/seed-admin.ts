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
  console.log("🌱 Seeding admin users...");

  try {
    // ============================
    // ADMIN USER
    // ============================
    const adminUser = await prisma.users.upsert({
      where: { email: "admin@contacts.travelwithyuyana.com" },
      update: {
        name: "Administrator",
        username: "admin",
        is_admin: true,
        is_account_admin: true,
        userStatus: "ACTIVE",
        userLanguage: "en",
        role: "ADMIN",
      },
      create: {
        email: "admin@contacts.travelwithyuyana.com",
        name: "Administrator",
        username: "admin",
        is_admin: true,
        is_account_admin: true,
        userStatus: "ACTIVE",
        userLanguage: "en",
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created/updated:", adminUser.email);

    console.log("🎉 Admin seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
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
