//@ts-nocheck
import { PrismaClient, gptStatus, crmLeadStatus, crmLeadType, crmOpportunityStatus, crmContactType, crmContractsStatus, ActiveStatus, Language } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env.local for test user credentials
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/*
Full seed data is used to populate the database with comprehensive initial data for development and testing.
*/
//Menu Items
import moduleData from "../initial-data/system_Modules_Enabled.json";
//GPT Models
import gptModelsDataRaw from "../initial-data/gpt_Models.json";

const gptModelsData = gptModelsDataRaw.map((item) => ({
  ...item,
  status: item.status as gptStatus,
}));
//CRM
import crmOpportunityTypeData from "../initial-data/crm_Opportunities_Type.json";
import crmOpportunitySaleStagesData from "../initial-data/crm_Opportunities_Sales_Stages.json";
import crmCampaignsData from "../initial-data/crm_campaigns.json";
import crmIndustryTypeData from "../initial-data/crm_Industry_Type.json";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Your seeding logic here using Prisma Client
  console.log("-------- Seeding DB with comprehensive data --------");

  //Seed Menu Items
  const modules = await prisma.system_Modules_Enabled.findMany();

  if (modules.length === 0) {
    await prisma.system_Modules_Enabled.createMany({
      data: moduleData,
    });
    console.log("Modules seeded successfully");
  } else {
    console.log("Modules already seeded");
  }

  //Seed CRM Opportunity Types
  const crmOpportunityType = await prisma.crm_Opportunities_Type.findMany();

  if (crmOpportunityType.length === 0) {
    await prisma.crm_Opportunities_Type.createMany({
      data: crmOpportunityTypeData,
    });
    console.log("Opportunity Types seeded successfully");
  } else {
    console.log("Opportunity Types already seeded");
  }

  const crmOpportunitySaleStages =
    await prisma.crm_Opportunities_Sales_Stages.findMany();

  if (crmOpportunitySaleStages.length === 0) {
    await prisma.crm_Opportunities_Sales_Stages.createMany({
      data: crmOpportunitySaleStagesData,
    });
    console.log("Opportunity Sales Stages seeded successfully");
  } else {
    console.log("Opportunity Sales Stages already seeded");
  }

  const crmCampaigns = await prisma.crm_campaigns.findMany();

  if (crmCampaigns.length === 0) {
    await prisma.crm_campaigns.createMany({
      data: crmCampaignsData,
    });
    console.log("Campaigns seeded successfully");
  } else {
    console.log("Campaigns already seeded");
  }

  const crmIndustryType = await prisma.crm_Industry_Type.findMany();

  if (crmIndustryType.length === 0) {
    await prisma.crm_Industry_Type.createMany({
      data: crmIndustryTypeData,
    });
    console.log("Industry Types seeded successfully");
  } else {
    console.log("Industry Types already seeded");
  }

  //Seed GPT Models
  const gptModels = await prisma.gpt_models.findMany();

  if (gptModels.length === 0) {
    await prisma.gpt_models.createMany({
      data: gptModelsData,
    });
    console.log("GPT Models seeded successfully");
  } else {
    console.log("GPT Models already seeded");
  }

  //Seed Industries if not present
  const industries = await prisma.crm_Industry_Type.findMany();
  let industryIds: string[] = [];
  if (industries.length === 0) {
    const newIndustries = await prisma.crm_Industry_Type.createManyAndReturn({
      data: [
        { name: "Technology", description: "Software, hardware, IT services" },
        { name: "Healthcare", description: "Medical services, pharmaceuticals" },
        { name: "Finance", description: "Banking, insurance, investment" },
        { name: "Retail", description: "E-commerce, physical stores" },
        { name: "Manufacturing", description: "Production, industrial" },
        { name: "Travel & Tourism", description: "Airlines, hotels, tour operators" },
        { name: "Education", description: "Schools, universities, training" },
        { name: "Real Estate", description: "Property development, management" },
      ]
    });
    industryIds = newIndustries.map(i => i.id);
    console.log("Sample industries created");
  } else {
    industryIds = industries.map(i => i.id);
  }

  //Seed Accounts if not present
  const existingAccounts = await prisma.crm_Accounts.findMany();
  if (existingAccounts.length === 0) {
    const sampleAccounts = [
      {
        name: "Ethiopian Airlines",
        email: "contact@ethiopianairlines.com",
        office_phone: "+251-11-517-4000",
        industry: industryIds[5], // Travel & Tourism
        employees: "10000+",
        annual_revenue: "5000000000",
        billing_city: "Addis Ababa",
        billing_country: "Ethiopia",
        status: "Active",
        type: "Customer",
        description: "Flag carrier airline of Ethiopia"
      },
      {
        name: "Commercial Bank of Ethiopia",
        email: "info@cbe.com.et",
        office_phone: "+251-11-555-1234",
        industry: industryIds[2], // Finance
        employees: "15000+",
        annual_revenue: "20000000000",
        billing_city: "Addis Ababa",
        billing_country: "Ethiopia",
        status: "Active",
        type: "Customer",
        description: "Largest bank in Ethiopia"
      },
      {
        name: "Safaricom PLC",
        email: "info@safaricom.co.ke",
        office_phone: "+254-20-326-0000",
        industry: industryIds[0], // Technology
        employees: "5000+",
        annual_revenue: "3000000000",
        billing_city: "Nairobi",
        billing_country: "Kenya",
        status: "Active",
        type: "Partner",
        description: "Leading telecom operator in Kenya"
      },
      {
        name: "Addis Ababa University",
        email: "info@aau.edu.et",
        office_phone: "+251-11-122-4401",
        industry: industryIds[6], // Education
        employees: "5000+",
        annual_revenue: "100000000",
        billing_city: "Addis Ababa",
        billing_country: "Ethiopia",
        status: "Active",
        type: "Customer",
        description: "Premier university in Ethiopia"
      },
      {
        name: "Yuyana Travel & Tours",
        email: "info@yuyana.com",
        office_phone: "+251-922-106-900",
        industry: industryIds[5], // Travel & Tourism
        employees: "50+",
        annual_revenue: "10000000",
        billing_city: "Addis Ababa",
        billing_country: "Ethiopia",
        status: "Active",
        type: "Customer",
        description: "Premium travel and tour operator in Ethiopia"
      }
    ];

    for (const account of sampleAccounts) {
      await prisma.crm_Accounts.create({
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
        }
      });
    }
    console.log("Sample accounts created");
  }

  //Seed Contacts if not present
  const existingContacts = await prisma.crm_Contacts.findMany();
  if (existingContacts.length === 0) {
    const accounts = await prisma.crm_Accounts.findMany();
    const accountIds = accounts.map(a => a.id);
    
    const sampleContacts = [
      {
        first_name: "Alem",
        last_name: "Tadesse",
        email: "alem.tadesse@ethiopianairlines.com",
        office_phone: "+251-11-517-4001",
        position: "Director of Operations",
        account: accountIds[0], // Ethiopian Airlines
        type: "Customer" as crmContactType,
        status: true
      },
      {
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@cbe.com.et",
        office_phone: "+251-11-555-1235",
        position: "Head of Digital Banking",
        account: accountIds[1], // Commercial Bank of Ethiopia
        type: "Customer" as crmContactType,
        status: true
      },
      {
        first_name: "Michael",
        last_name: "Omondi",
        email: "michael.omondi@safaricom.co.ke",
        office_phone: "+254-20-326-0001",
        position: "VP of Partnerships",
        account: accountIds[2], // Safaricom
        type: "Partner" as crmContactType,
        status: true
      },
      {
        first_name: "Dr. Yared",
        last_name: "Mulugeta",
        email: "yared.mulugeta@aau.edu.et",
        office_phone: "+251-11-122-4402",
        position: "Dean of Engineering",
        account: accountIds[3], // Addis Ababa University
        type: "Customer" as crmContactType,
        status: true
      },
      {
        first_name: "Abel",
        last_name: "Berhanu",
        email: "abel.berhanu@yuyana.com",
        office_phone: "+251-922-106-901",
        position: "CEO",
        account: accountIds[4], // Yuyana Travel & Tours
        type: "Customer" as crmContactType,
        status: true
      }
    ];

    for (const contact of sampleContacts) {
      await prisma.crm_Contacts.create({
        data: {
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          office_phone: contact.office_phone,
          position: contact.position,
          account: contact.account,
          type: contact.type,
          status: contact.status,
          description: `Contact for ${contact.first_name} ${contact.last_name}`
        }
      });
    }
    console.log("Sample contacts created");
  }

  //Seed Leads if not present
  const existingLeads = await prisma.crm_Leads.findMany();
  if (existingLeads.length === 0) {
    const accounts = await prisma.crm_Accounts.findMany();
    const accountIds = accounts.map(a => a.id);
    const contacts = await prisma.crm_Contacts.findMany();
    const contactIds = contacts.map(c => c.id);
    
    const sampleLeads = [
      {
        firstName: "Hirut",
        lastName: "Bekele",
        company: "Hotel Sky",
        jobTitle: "General Manager",
        email: "h.bekele@hotelsky.et",
        phone: "+251-11-123-4567",
        description: "Potential client interested in corporate travel packages",
        lead_source: "Trade Show",
        campaign: "Q1 Tourism Promotion",
        status: "QUALIFIED" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4] // Yuyana Travel & Tours
      },
      {
        firstName: "Kiros",
        lastName: "Haile",
        company: "Blue Nile Tours",
        jobTitle: "Operations Director",
        email: "k.haile@blueniletours.et",
        phone: "+251-11-234-5678",
        description: "Looking for group tour management solutions",
        lead_source: "Referral",
        campaign: "Referral Program",
        status: "NEW" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4] // Yuyana Travel & Tours
      },
      {
        firstName: "Selam",
        lastName: "Tekle",
        company: "Ethiopian Ministry of Tourism",
        jobTitle: "Director",
        email: "s.tekle@tourism.gov.et",
        phone: "+251-11-345-6789",
        description: "Government partnership inquiry",
        lead_source: "Direct Mail",
        campaign: "Government Outreach",
        status: "CONTACTED" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4] // Yuyana Travel & Tours
      }
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
          status: lead.status,
          type: lead.type,
          accountsIDs: lead.accountsIDs
        }
      });
    }
    console.log("Sample leads created");
  }

  //Seed Opportunities if not present
  const existingOpportunities = await prisma.crm_Opportunities.findMany();
  if (existingOpportunities.length === 0) {
    const accounts = await prisma.crm_Accounts.findMany();
    const accountIds = accounts.map(a => a.id);
    const contacts = await prisma.crm_Contacts.findMany();
    const contactIds = contacts.map(c => c.id);
    const campaigns = await prisma.crm_campaigns.findMany();
    const campaignIds = campaigns.map(c => c.id);
    const stages = await prisma.crm_Opportunities_Sales_Stages.findMany();
    const stageIds = stages.map(s => s.id);
    const types = await prisma.crm_Opportunities_Type.findMany();
    const typeIds = types.map(t => t.id);
    
    const sampleOpportunities = [
      {
        name: "Corporate Travel Management Contract",
        account: accountIds[0], // Ethiopian Airlines
        contact: contactIds[0], // Alem Tadesse
        campaign: campaignIds[0], // Trade Show
        sales_stage: stageIds[2], // Solution Proposal (50% probability)
        type: typeIds[0], // New Business
        status: "ACTIVE" as crmOpportunityStatus,
        expected_revenue: 500000,
        close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        description: "Annual corporate travel contract for staff",
        budget: 600000,
        currency: "USD"
      },
      {
        name: "University Student Exchange Program",
        account: accountIds[3], // Addis Ababa University
        contact: contactIds[3], // Dr. Yared Mulugeta
        campaign: campaignIds[2], // Referral Program
        sales_stage: stageIds[1], // Needs Analysis (25% probability)
        type: typeIds[0], // New Business
        status: "ACTIVE" as crmOpportunityStatus,
        expected_revenue: 250000,
        close_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        description: "Study abroad programs for engineering students",
        budget: 300000,
        currency: "USD"
      },
      {
        name: "Tour Operator Partnership",
        account: accountIds[4], // Yuyana Travel & Tours
        contact: contactIds[4], // Abel Berhanu
        campaign: campaignIds[4], // Direct Mail
        sales_stage: stageIds[3], // Negotiation (75% probability)
        type: typeIds[1], // Existing Business
        status: "ACTIVE" as crmOpportunityStatus,
        expected_revenue: 100000,
        close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: "Expanding tour offerings with new destinations",
        budget: 120000,
        currency: "USD"
      }
    ];

    for (const opportunity of sampleOpportunities) {
      await prisma.crm_Opportunities.create({
        data: {
          name: opportunity.name,
          account: opportunity.account,
          contact: opportunity.contact,
          campaign: opportunity.campaign,
          sales_stage: opportunity.sales_stage,
          type: opportunity.type,
          status: opportunity.status,
          expected_revenue: opportunity.expected_revenue,
          close_date: opportunity.close_date,
          description: opportunity.description,
          budget: opportunity.budget,
          currency: opportunity.currency
        }
      });
    }
    console.log("Sample opportunities created");
  }

  //Seed Contracts if not present
  const existingContracts = await prisma.crm_Contracts.findMany();
  if (existingContracts.length === 0) {
    const accounts = await prisma.crm_Accounts.findMany();
    const accountIds = accounts.map(a => a.id);
    
    const sampleContracts = [
      {
        title: "Corporate Travel Services Agreement",
        value: 300000,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        account: accountIds[0], // Ethiopian Airlines
        status: "INPROGRESS" as crmContractsStatus,
        description: "Annual corporate travel services agreement",
        type: "Service"
      },
      {
        title: "Educational Partnership Contract",
        value: 150000,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        account: accountIds[3], // Addis Ababa University
        status: "SIGNED" as crmContractsStatus,
        description: "Student exchange program agreement",
        type: "Partnership"
      }
    ];

    for (const contract of sampleContracts) {
      await prisma.crm_Contracts.create({
        data: {
          title: contract.title,
          value: contract.value,
          startDate: contract.startDate,
          endDate: contract.endDate,
          account: contract.account,
          status: contract.status,
          description: contract.description,
          type: contract.type
        }
      });
    }
    console.log("Sample contracts created");
  }

  //Seed Test User for E2E Testing
  const testUserEmail = process.env.TEST_USER_EMAIL || "test@yuyana-crm.test";
  const testUserPassword = process.env.TEST_USER_PASSWORD || "TestPass123!";

  const existingTestUser = await prisma.users.findUnique({
    where: { email: testUserEmail },
  });

  const hashedPassword = await bcrypt.hash(testUserPassword, 10);

  if (!existingTestUser) {
    await prisma.users.create({
      data: {
        email: testUserEmail,
        name: "Test User",
        password: hashedPassword,
        userStatus: "ACTIVE" as ActiveStatus,
        is_admin: true,
        is_account_admin: true,
        userLanguage: "en" as Language,
      },
    });
    console.log(`Test user created: ${testUserEmail}`);
  } else {
    // Update password and status to ensure it matches env vars
    await prisma.users.update({
      where: { email: testUserEmail },
      data: {
        password: hashedPassword,
        userStatus: "ACTIVE" as ActiveStatus,
        is_admin: true,
        is_account_admin: true,
        userLanguage: "en" as Language,
      },
    });
    console.log(`Test user updated: ${testUserEmail}`);
  }

  //Seed additional sample users
  const sampleUsers = [
    {
      email: "admin@yuyana-crm.test",
      name: "System Administrator",
      password: "AdminPass123!",
      userStatus: "ACTIVE" as ActiveStatus,
      is_admin: true,
      is_account_admin: true,
      userLanguage: "en" as Language,
    },
    {
      email: "sales-manager@yuyana-crm.test",
      name: "Sales Manager",
      password: "SalesPass123!",
      userStatus: "ACTIVE" as ActiveStatus,
      is_admin: false,
      is_account_admin: false,
      userLanguage: "en" as Language,
    },
    {
      email: "sales-agent@yuyana-crm.test",
      name: "Sales Agent",
      password: "AgentPass123!",
      userStatus: "ACTIVE" as ActiveStatus,
      is_admin: false,
      is_account_admin: false,
      userLanguage: "en" as Language,
    },
    {
      email: "marketing@yuyana-crm.test",
      name: "Marketing Specialist",
      password: "MarketingPass123!",
      userStatus: "ACTIVE" as ActiveStatus,
      is_admin: false,
      is_account_admin: false,
      userLanguage: "en" as Language,
    }
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.users.findUnique({
      where: { email: userData.email },
    });

    const userHashedPassword = await bcrypt.hash(userData.password, 10);

    if (!existingUser) {
      await prisma.users.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: userHashedPassword,
          userStatus: userData.userStatus,
          is_admin: userData.is_admin,
          is_account_admin: userData.is_account_admin,
          userLanguage: userData.userLanguage,
        },
      });
      console.log(`Sample user created: ${userData.email}`);
    }
  }

  console.log("-------- Full seed DB completed --------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });