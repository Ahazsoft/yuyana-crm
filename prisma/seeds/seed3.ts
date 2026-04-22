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
  console.log("🌱 Seeding database...");

  // ============================
  // USERS (use UPSERT to avoid duplicate email error)
  // ============================
  const adminUser = await prisma.users.upsert({
    where: { email: "admin@test.com" },
    update: {
      name: "Admin User",
      username: "admin",
      password: "hashed_password",
      is_admin: true,
      is_account_admin: true,
      userStatus: "ACTIVE",
      userLanguage: "en",
    },
    create: {
      email: "admin@test.com",
      name: "Admin User",
      username: "admin",
      password: "hashed_password",
      is_admin: true,
      is_account_admin: true,
      userStatus: "ACTIVE",
      userLanguage: "en",
    },
  });

  const normalUser = await prisma.users.upsert({
    where: { email: "user@test.com" },
    update: {
      name: "Normal User",
      username: "user",
      password: "hashed_password",
      is_admin: false,
      is_account_admin: false,
      userStatus: "ACTIVE",
      userLanguage: "en",
    },
    create: {
      email: "user@test.com",
      name: "Normal User",
      username: "user",
      password: "hashed_password",
      is_admin: false,
      is_account_admin: false,
      userStatus: "ACTIVE",
      userLanguage: "en",
    },
  });

  // ============================
  // CRM INDUSTRY TYPE (2 records)
  // ============================
  const industry1 = await prisma.crm_Industry_Type.create({
    data: { v: 0, name: "IT Services" },
  });

  const industry2 = await prisma.crm_Industry_Type.create({
    data: { v: 0, name: "Finance" },
  });

  // ============================
  // CRM CAMPAIGNS (2 records)
  // ============================
  const campaign1 = await prisma.crm_campaigns.create({
    data: {
      v: 0,
      name: "Summer Campaign",
      description: "Seed campaign for opportunities",
      status: "ACTIVE",
    },
  });

  const campaign2 = await prisma.crm_campaigns.create({
    data: {
      v: 0,
      name: "Winter Campaign",
      description: "Second seed campaign",
      status: "ACTIVE",
    },
  });

  // ============================
  // OPPORTUNITY SALES STAGES (2 records)
  // ============================
  const salesStage1 = await prisma.crm_Opportunities_Sales_Stages.create({
    data: {
      v: 0,
      name: "Qualification",
      probability: BigInt(25),
      order: BigInt(1),
    },
  });

  const salesStage2 = await prisma.crm_Opportunities_Sales_Stages.create({
    data: {
      v: 0,
      name: "Proposal",
      probability: BigInt(50),
      order: BigInt(2),
    },
  });

  // ============================
  // OPPORTUNITY TYPES (2 records)
  // ============================
  const oppType1 = await prisma.crm_Opportunities_Type.create({
    data: {
      v: 0,
      name: "New Business",
      order: BigInt(1),
    },
  });

  const oppType2 = await prisma.crm_Opportunities_Type.create({
    data: {
      v: 0,
      name: "Upsell",
      order: BigInt(2),
    },
  });

  // ============================
  // CRM ACCOUNTS (2 records)
  // ============================
  const account1 = await prisma.crm_Accounts.create({
    data: {
      v: 0,
      name: "Test Company s.r.o",
      email: "info@testcompany.com",
      website: "https://testcompany.com",
      office_phone: "+420777777777",
      status: "Active",
      type: "Customer",
      annual_revenue: "1000000",
      employees: "50",
      description: "Example seeded company account",
      assigned_to: normalUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      industry: industry1.id,
      billing_city: "Prague",
      billing_country: "Czech Republic",
      billing_street: "Main Street 123",
    },
  });

  const account2 = await prisma.crm_Accounts.create({
    data: {
      v: 0,
      name: "Second Company Ltd",
      email: "info@secondcompany.com",
      website: "https://secondcompany.com",
      office_phone: "+420888888888",
      status: "Active",
      type: "Partner",
      annual_revenue: "5000000",
      employees: "120",
      description: "Second seeded company account",
      assigned_to: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      industry: industry2.id,
      billing_city: "Brno",
      billing_country: "Czech Republic",
      billing_street: "Second Street 555",
    },
  });

  // ============================
  // CRM LEADS (2 records)
  // ============================
  const lead1 = await prisma.crm_Leads.create({
    data: {
      v: 0,
      firstName: "John",
      lastName: "Leadman",
      email: "lead@test.com",
      phone: "+420111111111",
      company: "Lead Company",
      status: "NEW",
      type: "DEMO",
      description: "Seed lead example",
      assigned_to: normalUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      accountsIDs: account1.id,
    },
  });

  const lead2 = await prisma.crm_Leads.create({
    data: {
      v: 0,
      firstName: "Eva",
      lastName: "SecondLead",
      email: "lead2@test.com",
      phone: "+420222222222",
      company: "Second Lead Company",
      status: "CONTACTED",
      type: "DEMO",
      description: "Second seed lead example",
      assigned_to: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      accountsIDs: account2.id,
    },
  });

  // ============================
  // CRM CONTACTS (2 records)
  // ============================
  const contact1 = await prisma.crm_Contacts.create({
    data: {
      v: 0,
      first_name: "Peter",
      last_name: "Contactman",
      email: "contact@test.com",
      mobile_phone: "+420999999999",
      position: "CEO",
      status: true,
      type: "Customer",
      tags: ["vip", "important"],
      notes: ["Seeded note 1", "Seeded note 2"],
      assigned_to: normalUser.id,
      created_by: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      accountsIDs: account1.id,
    },
  });

  const contact2 = await prisma.crm_Contacts.create({
    data: {
      v: 0,
      first_name: "Lucie",
      last_name: "Managerova",
      email: "contact2@test.com",
      mobile_phone: "+420333333333",
      position: "Sales Manager",
      status: true,
      type: "Partner",
      tags: ["partner"],
      notes: ["Second seeded contact"],
      assigned_to: adminUser.id,
      created_by: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      accountsIDs: account2.id,
    },
  });

  // ============================
  // CRM OPPORTUNITIES (2 records)
  // ============================
  const opportunity1 = await prisma.crm_Opportunities.create({
    data: {
      v: 0,
      name: "Opportunity for Test Company",
      description: "Seed opportunity",
      budget: BigInt(50000),
      expected_revenue: BigInt(60000),
      currency: "EUR",
      status: "ACTIVE",

      account: account1.id,
      assigned_to: normalUser.id,
      created_by: adminUser.id,
      campaign: campaign1.id,
      sales_stage: salesStage1.id,
      type: oppType1.id,

      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const opportunity2 = await prisma.crm_Opportunities.create({
    data: {
      v: 0,
      name: "Opportunity for Second Company",
      description: "Second seeded opportunity",
      budget: BigInt(200000),
      expected_revenue: BigInt(250000),
      currency: "EUR",
      status: "ACTIVE",

      account: account2.id,
      assigned_to: adminUser.id,
      created_by: adminUser.id,
      campaign: campaign2.id,
      sales_stage: salesStage2.id,
      type: oppType2.id,

      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  // ============================
  // CONTACTS <-> OPPORTUNITIES junction (2 records)
  // ============================
  await prisma.contactsToOpportunities.create({
    data: {
      contact_id: contact1.id,
      opportunity_id: opportunity1.id,
    },
  });

  await prisma.contactsToOpportunities.create({
    data: {
      contact_id: contact2.id,
      opportunity_id: opportunity2.id,
    },
  });

  // ============================
  // CRM CONTRACTS (2 records)
  // ============================
  await prisma.crm_Contracts.create({
    data: {
      v: 0,
      title: "Service Contract 2026",
      value: 15000,
      description: "Seed contract example",
      status: "SIGNED",
      account: account1.id,
      assigned_to: normalUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  await prisma.crm_Contracts.create({
    data: {
      v: 0,
      title: "Enterprise Contract 2026",
      value: 50000,
      description: "Second seeded contract",
      status: "INPROGRESS",
      account: account2.id,
      assigned_to: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  // ============================
  // BOARDS + SECTIONS + TASKS (2 boards)
  // ============================
  const board1 = await prisma.boards.create({
    data: {
      v: 0,
      title: "Development Board",
      description: "Seed board",
      user: normalUser.id,
      visibility: "private",
      sharedWith: [adminUser.id],
      createdBy: normalUser.id,
      updatedBy: normalUser.id,
    },
  });

  const board2 = await prisma.boards.create({
    data: {
      v: 0,
      title: "Sales Board",
      description: "Second seeded board",
      user: adminUser.id,
      visibility: "private",
      sharedWith: [normalUser.id],
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const section1 = await prisma.sections.create({
    data: {
      v: 0,
      board: board1.id,
      title: "To Do",
      position: BigInt(1),
    },
  });

  const section2 = await prisma.sections.create({
    data: {
      v: 0,
      board: board2.id,
      title: "Pipeline",
      position: BigInt(1),
    },
  });

  const task1 = await prisma.tasks.create({
    data: {
      v: 0,
      title: "Seed Task",
      content: "This is a seeded task example",
      position: BigInt(1),
      priority: "HIGH",
      section: section1.id,
      user: normalUser.id,
      createdBy: normalUser.id,
      updatedBy: normalUser.id,
      taskStatus: "ACTIVE",
    },
  });

  const task2 = await prisma.tasks.create({
    data: {
      v: 0,
      title: "Seed Sales Task",
      content: "Second seeded task",
      position: BigInt(1),
      priority: "MEDIUM",
      section: section2.id,
      user: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      taskStatus: "ACTIVE",
    },
  });

  // ============================
  // CRM ACCOUNT TASKS (2 records)
  // ============================
  const crmTask1 = await prisma.crm_Accounts_Tasks.create({
    data: {
      v: 0,
      title: "Call customer",
      content: "Call seeded account for follow-up",
      priority: "MEDIUM",
      user: normalUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      account: account1.id,
      taskStatus: "ACTIVE",
    },
  });

  const crmTask2 = await prisma.crm_Accounts_Tasks.create({
    data: {
      v: 0,
      title: "Send proposal",
      content: "Send proposal to second account",
      priority: "HIGH",
      user: adminUser.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      account: account2.id,
      taskStatus: "ACTIVE",
    },
  });

  // ============================
  // TASK COMMENTS (2 records)
  // ============================
  await prisma.tasksComments.create({
    data: {
      v: 0,
      comment: "Seeded comment on task",
      task: task1.id,
      user: normalUser.id,
      assigned_crm_account_task: crmTask1.id,
    },
  });

  await prisma.tasksComments.create({
    data: {
      v: 0,
      comment: "Second seeded comment",
      task: task2.id,
      user: adminUser.id,
      assigned_crm_account_task: crmTask2.id,
    },
  });

  // ============================
  // INVOICE STATES (2 records)
  // ============================
  const invoiceState1 = await prisma.invoice_States.create({
    data: { name: "PAID" },
  });

  const invoiceState2 = await prisma.invoice_States.create({
    data: { name: "PENDING" },
  });

  // ============================
  // INVOICES (2 records)
  // ============================
  const invoice1 = await prisma.invoices.create({
    data: {
      invoice_file_mimeType: "application/pdf",
      invoice_file_url: "https://example.com/invoice1.pdf",
      invoice_number: "INV-2026-001",
      invoice_amount: "1200",
      status: "PAID",
      invoice_type: "SALES",
      invoice_currency: "EUR",
      invoice_state_id: invoiceState1.id,
      assigned_user_id: normalUser.id,
      assigned_account_id: account1.id,
    },
  });

  const invoice2 = await prisma.invoices.create({
    data: {
      invoice_file_mimeType: "application/pdf",
      invoice_file_url: "https://example.com/invoice2.pdf",
      invoice_number: "INV-2026-002",
      invoice_amount: "5500",
      status: "PENDING",
      invoice_type: "SALES",
      invoice_currency: "EUR",
      invoice_state_id: invoiceState2.id,
      assigned_user_id: adminUser.id,
      assigned_account_id: account2.id,
    },
  });

  // ============================
  // DOCUMENT TYPES (2 records)
  // ============================
  const docType1 = await prisma.documents_Types.create({
    data: { v: 0, name: "PDF Document" },
  });

  const docType2 = await prisma.documents_Types.create({
    data: { v: 0, name: "Contract Document" },
  });

  // ============================
  // DOCUMENTS (2 records)
  // ============================
  const document1 = await prisma.documents.create({
    data: {
      document_name: "Seed Document 1",
      description: "Seeded document example",
      document_file_mimeType: "application/pdf",
      document_file_url: "https://example.com/doc1.pdf",
      status: "ACTIVE",
      visibility: "private",
      favourite: true,
      size: 1000,
      key: "seed-doc-key-1",
      document_type: docType1.id,
      assigned_user: normalUser.id,
      created_by_user: adminUser.id,
      createdBy: adminUser.id,
    },
  });

  const document2 = await prisma.documents.create({
    data: {
      document_name: "Seed Document 2",
      description: "Second seeded document",
      document_file_mimeType: "application/pdf",
      document_file_url: "https://example.com/doc2.pdf",
      status: "ACTIVE",
      visibility: "private",
      favourite: false,
      size: 2000,
      key: "seed-doc-key-2",
      document_type: docType2.id,
      assigned_user: adminUser.id,
      created_by_user: adminUser.id,
      createdBy: adminUser.id,
    },
  });

  // ============================
  // DOCUMENT JUNCTION TABLES
  // ============================
  await prisma.documentsToInvoices.create({
    data: { document_id: document1.id, invoice_id: invoice1.id },
  });

  await prisma.documentsToInvoices.create({
    data: { document_id: document2.id, invoice_id: invoice2.id },
  });

  await prisma.documentsToAccounts.create({
    data: { document_id: document1.id, account_id: account1.id },
  });

  await prisma.documentsToAccounts.create({
    data: { document_id: document2.id, account_id: account2.id },
  });

  await prisma.documentsToLeads.create({
    data: { document_id: document1.id, lead_id: lead1.id },
  });

  await prisma.documentsToLeads.create({
    data: { document_id: document2.id, lead_id: lead2.id },
  });

  await prisma.documentsToOpportunities.create({
    data: { document_id: document1.id, opportunity_id: opportunity1.id },
  });

  await prisma.documentsToOpportunities.create({
    data: { document_id: document2.id, opportunity_id: opportunity2.id },
  });

  await prisma.documentsToContacts.create({
    data: { document_id: document1.id, contact_id: contact1.id },
  });

  await prisma.documentsToContacts.create({
    data: { document_id: document2.id, contact_id: contact2.id },
  });

  await prisma.documentsToTasks.create({
    data: { document_id: document1.id, task_id: task1.id },
  });

  await prisma.documentsToTasks.create({
    data: { document_id: document2.id, task_id: task2.id },
  });

  await prisma.documentsToCrmAccountsTasks.create({
    data: { document_id: document1.id, crm_accounts_task_id: crmTask1.id },
  });

  await prisma.documentsToCrmAccountsTasks.create({
    data: { document_id: document2.id, crm_accounts_task_id: crmTask2.id },
  });

  // ============================
  // WATCHERS
  // ============================
  await prisma.accountWatchers.create({
    data: { account_id: account1.id, user_id: adminUser.id },
  });

  await prisma.accountWatchers.create({
    data: { account_id: account2.id, user_id: normalUser.id },
  });

  await prisma.boardWatchers.create({
    data: { board_id: board1.id, user_id: adminUser.id },
  });

  await prisma.boardWatchers.create({
    data: { board_id: board2.id, user_id: normalUser.id },
  });

  console.log("✅ Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });