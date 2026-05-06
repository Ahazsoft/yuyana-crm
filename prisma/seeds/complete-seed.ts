// @ts-nocheck
import {
  PrismaClient,
  gptStatus,
  crmLeadStatus,
  crmLeadType,
  crmOpportunityStatus,
  crmContactType,
  crmContractsStatus,
  ActiveStatus,
  Language,
  DocumentSystemType,
} from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import moduleData from "../initial-data/system_Modules_Enabled.json";
import gptModelsDataRaw from "../initial-data/gpt_Models.json";
import crmOpportunityTypeData from "../initial-data/crm_Opportunities_Type.json";
import crmOpportunitySaleStagesData from "../initial-data/crm_Opportunities_Sales_Stages.json";
import crmCampaignsData from "../initial-data/crm_campaigns.json";
import crmIndustryTypeData from "../initial-data/crm_Industry_Type.json";

const gptModelsData = gptModelsDataRaw.map((item) => ({
  ...item,
  status: item.status as gptStatus,
}));

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("-------- Force seeding DB (deleting existing data) --------");

  // Delete in reverse dependency order (skip Boards and related)
  await prisma.$transaction([
    prisma.DocumentsToContracts.deleteMany(),
    prisma.ContactsToOpportunities.deleteMany(),
    prisma.DocumentsToAccounts.deleteMany(),
    prisma.DocumentsToLeads.deleteMany(),
    prisma.DocumentsToCrmAccountsTasks.deleteMany(),
    prisma.DocumentsToTasks.deleteMany(),
    prisma.DocumentsToContacts.deleteMany(),
    prisma.DocumentsToOpportunities.deleteMany(),
    prisma.DocumentsToInvoices.deleteMany(),
    prisma.Documents.deleteMany(),
    prisma.Invoices.deleteMany(),
    prisma.crm_Contracts.deleteMany(),
    prisma.crm_Opportunities.deleteMany(),
    prisma.crm_Leads.deleteMany(),
    prisma.crm_Contacts.deleteMany(),
    prisma.crm_Accounts.deleteMany(),
    prisma.crm_Industry_Type.deleteMany(),
    prisma.crm_campaigns.deleteMany(),
    prisma.crm_Opportunities_Sales_Stages.deleteMany(),
    prisma.crm_Opportunities_Type.deleteMany(),
    prisma.gpt_models.deleteMany(),
    prisma.system_Modules_Enabled.deleteMany(),
    prisma.users.deleteMany(),
  ]);
  console.log("Existing data deleted.");

  // ============ SEED USERS (must come first for relations) ============
  const sampleUsers = [
    {
      email: "admin@yuyana.com",
      name: "Yuyana Admin",
      password: "admin12345",
      userStatus: "ACTIVE" as ActiveStatus,
      is_admin: true,
      is_account_admin: true,
      userLanguage: "en" as Language,
    },
    {
      email: "sales@yuyana.com",
      name: "Sales User",
      password: "SalesPass123!",
      userStatus: "ACTIVE" as ActiveStatus,
      is_admin: false,
      is_account_admin: false,
      userLanguage: "en" as Language,
    },
  ];

  const createdUsers = [];
  for (const userData of sampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.users.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        userStatus: userData.userStatus,
        is_admin: userData.is_admin,
        is_account_admin: userData.is_account_admin,
        userLanguage: userData.userLanguage,
      },
    });
    createdUsers.push(user);
  }
  console.log("Users seeded");

  const adminUser = createdUsers.find(u => u.email === "admin@yuyana.com");
  const salesUser = createdUsers.find(u => u.email === "sales@yuyana.com");

  // ============ SEED BASE MODULES ============
  await prisma.system_Modules_Enabled.createMany({ data: moduleData });
  await prisma.gpt_models.createMany({ data: gptModelsData });
  await prisma.crm_Opportunities_Type.createMany({ data: crmOpportunityTypeData });
  await prisma.crm_Opportunities_Sales_Stages.createMany({ data: crmOpportunitySaleStagesData });
  await prisma.crm_campaigns.createMany({ data: crmCampaignsData });
  await prisma.crm_Industry_Type.createMany({ data: crmIndustryTypeData });

  // Additional industries
  const additionalIndustries = [
    "Travel & Tourism", "Hospitality", "Telecommunications", "Energy", "Mining",
    "Agriculture", "Construction", "Media", "Transportation", "Pharmaceuticals",
    "Insurance", "Automotive", "Food & Beverage", "Entertainment", "Non-profit",
  ];
  for (const name of additionalIndustries) {
    await prisma.crm_Industry_Type.create({ data: { name, v: 0 } });
  }
  console.log("Industries seeded");

  const allIndustries = await prisma.crm_Industry_Type.findMany();
  const industryIds = allIndustries.map(i => i.id);
  const campaigns = await prisma.crm_campaigns.findMany();
  const campaignIds = campaigns.map(c => c.id);
  const stages = await prisma.crm_Opportunities_Sales_Stages.findMany();
  const stageIds = stages.map(s => s.id);
  const oppTypes = await prisma.crm_Opportunities_Type.findMany();
  const typeIds = oppTypes.map(t => t.id);

  // ============ SEED ACCOUNTS ============
  const sampleAccounts = [
    {
      name: "Ethiopian Airlines",
      email: "contact@ethiopianairlines.com",
      office_phone: "+251-11-517-4000",
      industry: industryIds[5],
      employees: "501+",
      annual_revenue: "5000000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Customer",
      description: "Flag carrier airline of Ethiopia",
      website: "https://www.ethiopianairlines.com",
      fax: "+251-11-517-4001",
      vat: "ET123456789",
    },
    {
      name: "Commercial Bank of Ethiopia",
      email: "info@cbe.com.et",
      office_phone: "+251-11-555-1234",
      industry: industryIds[2],
      employees: "501+",
      annual_revenue: "20000000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Customer",
      description: "Largest bank in Ethiopia",
      website: "https://www.cbe.com.et",
      fax: "+251-11-555-1235",
      vat: "ET987654321",
    },
    {
      name: "Safaricom PLC",
      email: "info@safaricom.co.ke",
      office_phone: "+254-20-326-0000",
      industry: industryIds[8],
      employees: "501+",
      annual_revenue: "3000000000",
      billing_city: "Nairobi",
      billing_country: "Kenya",
      status: "Active",
      type: "Partner",
      description: "Leading telecom operator in Kenya",
      website: "https://www.safaricom.co.ke",
      fax: "+254-20-326-0001",
      vat: "KE456789123",
    },
    {
      name: "Addis Ababa University",
      email: "info@aau.edu.et",
      office_phone: "+251-11-122-4401",
      industry: industryIds[6],
      employees: "501+",
      annual_revenue: "100000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Customer",
      description: "Premier university in Ethiopia",
      website: "https://www.aau.edu.et",
      fax: "+251-11-122-4402",
      vat: "ET789123456",
    },
    {
      name: "Yuyana Travel & Tours",
      email: "info@yuyana.com",
      office_phone: "+251-922-106-900",
      industry: industryIds[5],
      employees: "11-50",
      annual_revenue: "10000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Customer",
      description: "Premium travel and tour operator in Ethiopia",
      website: "https://www.yuyana.com",
      fax: "+251-922-106-901",
      vat: "ET321654987",
    },
    {
      name: "MetaGold International",
      email: "info@metagold.com.et",
      office_phone: "+251-11-111-2222",
      industry: industryIds[10],
      employees: "501+",
      annual_revenue: "500000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Vendor",
      description: "Gold mining and export company",
      website: "https://www.metagold.com.et",
      fax: "+251-11-111-2223",
      vat: "ET654987321",
    },
    {
      name: "Dashen Bank",
      email: "info@dashenbank.com.et",
      office_phone: "+251-11-666-7777",
      industry: industryIds[2],
      employees: "501+",
      annual_revenue: "8000000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Customer",
      description: "Private commercial bank in Ethiopia",
      website: "https://www.dashenbank.com.et",
      fax: "+251-11-666-7778",
      vat: "ET987654321",
    },
    {
      name: "Hilton Addis Ababa",
      email: "info@hiltonaddisababa.com",
      office_phone: "+251-11-123-4567",
      industry: industryIds[7],
      employees: "501+",
      annual_revenue: "200000000",
      billing_city: "Addis Ababa",
      billing_country: "Ethiopia",
      status: "Active",
      type: "Partner",
      description: "Luxury hotel in Addis Ababa",
      website: "https://www.hilton.com/addisababa",
      fax: "+251-11-123-4568",
      vat: "ET147258369",
    },
  ];

  const createdAccounts = [];
  for (const account of sampleAccounts) {
    const acc = await prisma.crm_Accounts.create({
      data: {
        name: account.name,
        email: account.email,
        office_phone: account.office_phone,
        industry: account.industry,
        employees: account.employees,
        annual_revenue: account.annual_revenue,
        billing_city: account.billing_city,
        billing_country: account.billing_country,
        status: account.status,
        type: account.type,
        description: account.description,
        website: account.website,
        fax: account.fax,
        vat: account.vat,
        billing_state: "Addis Ababa",
        billing_street: "Bole Road",
        shipping_city: account.billing_city,
        shipping_country: account.billing_country,
        shipping_state: "Addis Ababa",
        shipping_street: "Bole Road",
        assigned_to: adminUser.id,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        v: 0,
      },
    });
    createdAccounts.push(acc);
  }
  console.log("Accounts seeded");

  const accountIds = createdAccounts.map(a => a.id);

  // ============ SEED CONTACTS ============
  const sampleContacts = [
    {
      first_name: "Alem", last_name: "Tadesse", email: "alem.tadesse@ethiopianairlines.com",
      office_phone: "+251-11-517-4001", position: "Director of Operations", account: accountIds[0],
      type: "Customer", status: true, description: "Operations head for Ethiopian Airlines",
      personal_email: "alem.personal@email.com", mobile_phone: "+251-911-222-333",
      birthday: "1980-05-15", social_twitter: "@alem_t", social_facebook: "alem.tadesse",
      social_linkedin: "alem-tadesse", tags: ["VIP", "Operations", "Travel"],
      notes: ["Has been with company for 15 years", "Decision maker for travel contracts"],
    },
    {
      first_name: "Demeke", last_name: "Almaw", email: "Deme.almaw@cbe.com.et",
      office_phone: "+251-11-555-1235", position: "Head of Digital Banking", account: accountIds[1],
      type: "Customer", status: true, description: "Digital banking head at CBE",
      personal_email: "sarah.j.personal@email.com", mobile_phone: "+251-911-333-444",
      birthday: "1985-08-22", social_twitter: "@sarah_j", social_facebook: "sarah.johnson",
      social_linkedin: "sarah-johnson", tags: ["VIP", "Digital", "Finance"],
      notes: ["Influencer in digital transformation initiatives"],
    },
    {
      first_name: "Dr. Yared", last_name: "Mulugeta", email: "yared.mulugeta@aau.edu.et",
      office_phone: "+251-11-122-4402", position: "Dean of Engineering", account: accountIds[3],
      type: "Customer", status: true, description: "Dean of Engineering faculty",
      personal_email: "yared.personal@email.com", mobile_phone: "+251-911-444-555",
      birthday: "1975-02-10", social_twitter: "@dr_yared", social_facebook: "yared.mulugeta",
      social_linkedin: "dr-yared-mulugeta", tags: ["Academia", "Engineering", "Education"],
      notes: ["Lead researcher in sustainable technologies"],
    },
    {
      first_name: "Abel", last_name: "Berhanu", email: "abel.berhanu@yuyana.com",
      office_phone: "+251-922-106-901", position: "CEO", account: accountIds[4],
      type: "Customer", status: true, description: "Chief Executive Officer",
      personal_email: "abel.personal@email.com", mobile_phone: "+251-911-555-666",
      birthday: "1982-07-18", social_twitter: "@abel_b", social_facebook: "abel.berhanu",
      social_linkedin: "abel-berhanu", tags: ["VIP", "CEO", "Travel"],
      notes: ["Founder and CEO of Yuyana Travel"],
    },
    {
      first_name: "Genet", last_name: "Woldemariam", email: "genet.w@metagold.com.et",
      office_phone: "+251-11-111-2224", position: "Operations Manager", account: accountIds[5],
      type: "Vendor", status: true, description: "Operations manager at mining company",
      personal_email: "grace.personal@email.com", mobile_phone: "+251-911-666-777",
      birthday: "1983-11-05", social_twitter: "@grace_w", social_facebook: "grace.woldemariam",
      social_linkedin: "grace-woldemariam", tags: ["Operations", "Mining", "Supply Chain"],
      notes: ["Handles procurement and supply chain"],
    },
    {
      first_name: "Dawit", last_name: "Kebede", email: "david.k@dashenbank.com.et",
      office_phone: "+251-11-666-7779", position: "Corporate Banking Director", account: accountIds[6],
      type: "Customer", status: true, description: "Director of corporate banking",
      personal_email: "david.personal@email.com", mobile_phone: "+251-911-777-888",
      birthday: "1979-03-25", social_twitter: "@david_k", social_facebook: "david.kebede",
      social_linkedin: "david-kebede", tags: ["Banking", "Corporate", "Finance"],
      notes: ["Manages corporate client relationships"],
    },
    {
      first_name: "Mariamawit", last_name: "Girma", email: "maria.g@hiltonaddisababa.com",
      office_phone: "+251-11-123-4569", position: "Sales Director", account: accountIds[7],
      type: "Partner", status: true, description: "Director of sales and marketing",
      personal_email: "maria.personal@email.com", mobile_phone: "+251-911-888-999",
      birthday: "1986-09-12", social_twitter: "@maria_g", social_facebook: "maria.girma",
      social_linkedin: "maria-girma", tags: ["Hospitality", "Sales", "Partnership"],
      notes: ["Handles group bookings and partnerships"],
    },
  ];

  const createdContacts = [];
  for (const contact of sampleContacts) {
    const c = await prisma.crm_Contacts.create({
      data: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        office_phone: contact.office_phone,
        position: contact.position,
        account: contact.account,
        type: contact.type as crmContactType,
        status: contact.status,
        description: contact.description,
        personal_email: contact.personal_email,
        mobile_phone: contact.mobile_phone,
        birthday: contact.birthday,
        social_twitter: contact.social_twitter,
        social_facebook: contact.social_facebook,
        social_linkedin: contact.social_linkedin,
        tags: contact.tags,
        notes: contact.notes,
        assigned_to: adminUser.id,
        created_by: adminUser.id,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        v: 0,
      },
    });
    createdContacts.push(c);
  }
  console.log("Contacts seeded");

  const contactIds = createdContacts.map(c => c.id);

  // ============ SEED LEADS ============
  const sampleLeads = [
    { firstName: "Hirut", lastName: "Bekele", company: "Hotel Sky", jobTitle: "General Manager", email: "h.bekele@hotelsky.et", phone: "+251-11-123-4567", description: "Potential client interested in corporate travel packages", lead_source: "Trade Show", campaign: campaignIds[0], status: "QUALIFIED", type: "DEMO", accountsIDs: accountIds[4], refered_by: "Travel Expo 2024" },
    { firstName: "Kiros", lastName: "Haile", company: "Blue Nile Tours", jobTitle: "Operations Director", email: "k.haile@blueniletours.et", phone: "+251-11-234-5678", description: "Looking for group tour management solutions", lead_source: "Referral", campaign: campaignIds[2], status: "NEW", type: "DEMO", accountsIDs: accountIds[4], refered_by: "Abel Berhanu" },
    { firstName: "Selam", lastName: "Tekle", company: "Ethiopian Ministry of Tourism", jobTitle: "Director", email: "s.tekle@tourism.gov.et", phone: "+251-11-345-6789", description: "Government partnership inquiry", lead_source: "Direct Mail", campaign: campaignIds[4], status: "CONTACTED", type: "DEMO", accountsIDs: accountIds[4], refered_by: "Government Contact" },
    { firstName: "Samuel", lastName: "Asfaw", company: "Red Sea Tourism", jobTitle: "CEO", email: "samuel.asfaw@redseatourism.com", phone: "+251-911-999-888", description: "Interest in luxury travel packages", lead_source: "Website", campaign: campaignIds[3], status: "NEW", type: "DEMO", accountsIDs: accountIds[4], refered_by: "Website Inquiry" },
    { firstName: "Leyla", lastName: "Mohammed", company: "Adama Hotels Group", jobTitle: "Revenue Manager", email: "leyla.m@adamahotels.com", phone: "+251-11-456-7890", description: "Seeking corporate travel solutions", lead_source: "LinkedIn", campaign: campaignIds[4], status: "QUALIFIED", type: "DEMO", accountsIDs: accountIds[4], refered_by: "LinkedIn Connection" },
  ];

  for (const lead of sampleLeads) {
    await prisma.crm_Leads.create({
      data: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        jobTitle: lead.jobTitle,
        email: lead.email,
        phone: lead.phone,
        description: lead.description,
        lead_source: lead.lead_source,
        campaign: lead.campaign,
        status: lead.status as crmLeadStatus,
        type: lead.type as crmLeadType,
        accountsIDs: lead.accountsIDs,
        refered_by: lead.refered_by,
        assigned_to: adminUser.id,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        v: 0,
      },
    });
  }
  console.log("Leads seeded");

  // ============ SEED OPPORTUNITIES ============
  const sampleOpportunities = [
    { name: "Corporate Travel Management Contract", account: accountIds[0], contact: contactIds[0], campaign: campaignIds[0], sales_stage: stageIds[2], type: typeIds[0], status: "ACTIVE", expected_revenue: 500000, close_date: new Date(Date.now() + 90*24*60*60*1000), description: "Annual corporate travel contract for staff", budget: 600000, currency: "USD", next_step: "Finalize contract terms" },
    { name: "University Student Exchange Program", account: accountIds[3], contact: contactIds[3], campaign: campaignIds[2], sales_stage: stageIds[1], type: typeIds[0], status: "ACTIVE", expected_revenue: 250000, close_date: new Date(Date.now() + 120*24*60*60*1000), description: "Study abroad programs for engineering students", budget: 300000, currency: "USD", next_step: "Prepare proposal document" },
    { name: "Tour Operator Partnership", account: accountIds[4], contact: contactIds[4], campaign: campaignIds[4], sales_stage: stageIds[3], type: typeIds[1], status: "ACTIVE", expected_revenue: 100000, close_date: new Date(Date.now() + 30*24*60*60*1000), description: "Expanding tour offerings with new destinations", budget: 120000, currency: "USD", next_step: "Sign partnership agreement" },
    { name: "Government Tourism Initiative", account: accountIds[4], contact: contactIds[4], campaign: campaignIds[4], sales_stage: stageIds[0], type: typeIds[0], status: "ACTIVE", expected_revenue: 1000000, close_date: new Date(Date.now() + 180*24*60*60*1000), description: "Large-scale tourism promotion project with government", budget: 1200000, currency: "USD", next_step: "Schedule initial meeting" },
    { name: "Corporate Event Planning", account: accountIds[6], contact: contactIds[6], campaign: campaignIds[3], sales_stage: stageIds[4], type: typeIds[2], status: "ACTIVE", expected_revenue: 75000, close_date: new Date(Date.now() - 10*24*60*60*1000), description: "Annual corporate retreat planning", budget: 80000, currency: "USD", next_step: "Execute event plan" },
  ];

  for (const opp of sampleOpportunities) {
    await prisma.crm_Opportunities.create({
      data: {
        name: opp.name,
        account: opp.account,
        contact: opp.contact,
        campaign: opp.campaign,
        sales_stage: opp.sales_stage,
        type: opp.type,
        status: opp.status as crmOpportunityStatus,
        expected_revenue: opp.expected_revenue,
        close_date: opp.close_date,
        description: opp.description,
        budget: opp.budget,
        currency: opp.currency,
        next_step: opp.next_step,
        created_by: adminUser.id,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        assigned_to: adminUser.id,
        v: 0,
      },
    });
  }
  console.log("Opportunities seeded");

  // ============ SEED CONTRACTS ============
  const sampleContracts = [
    { title: "Corporate Travel Services Agreement", value: 300000, startDate: new Date(Date.now() - 30*24*60*60*1000), endDate: new Date(Date.now() + 365*24*60*60*1000), account: accountIds[0], status: "INPROGRESS", description: "Annual corporate travel services agreement", type: "Service", customerSignedDate: new Date(Date.now() - 15*24*60*60*1000), companySignedDate: new Date(Date.now() - 10*24*60*60*1000), renewalReminderDate: new Date(Date.now() + 335*24*60*60*1000) },
    { title: "Educational Partnership Contract", value: 150000, startDate: new Date(Date.now() - 15*24*60*60*1000), endDate: new Date(Date.now() + 180*24*60*60*1000), account: accountIds[3], status: "SIGNED", description: "Student exchange program agreement", type: "Partnership", customerSignedDate: new Date(Date.now() - 20*24*60*60*1000), companySignedDate: new Date(Date.now() - 18*24*60*60*1000), renewalReminderDate: new Date(Date.now() + 150*24*60*60*1000) },
    { title: "Tour Operator Service Contract", value: 200000, startDate: new Date(Date.now() - 5*24*60*60*1000), endDate: new Date(Date.now() + 360*24*60*60*1000), account: accountIds[4], status: "SIGNED", description: "Expanded tour services contract", type: "Service", customerSignedDate: new Date(Date.now() - 7*24*60*60*1000), companySignedDate: new Date(Date.now() - 6*24*60*60*1000), renewalReminderDate: new Date(Date.now() + 330*24*60*60*1000) },
    { title: "Government Tourism Partnership", value: 500000, startDate: new Date(Date.now() + 10*24*60*60*1000), endDate: new Date(Date.now() + 730*24*60*60*1000), account: accountIds[4], status: "NOTSTARTED", description: "Multi-year tourism promotion partnership with government", type: "Partnership", renewalReminderDate: new Date(Date.now() + 700*24*60*60*1000) },
  ];

  for (const contract of sampleContracts) {
    await prisma.crm_Contracts.create({
      data: {
        title: contract.title,
        value: contract.value,
        startDate: contract.startDate,
        endDate: contract.endDate,
        account: contract.account,
        status: contract.status as crmContractsStatus,
        description: contract.description,
        type: contract.type,
        customerSignedDate: contract.customerSignedDate,
        companySignedDate: contract.companySignedDate,
        renewalReminderDate: contract.renewalReminderDate,
        assigned_to: adminUser.id,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        v: 0,
      },
    });
  }
  console.log("Contracts seeded");


  console.log("-------- Force seeding completed --------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());