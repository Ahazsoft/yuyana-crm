import { PrismaClient, gptStatus, crmLeadStatus, crmLeadType, crmOpportunityStatus, crmContactType, crmContractsStatus, ActiveStatus, Language, taskStatus, DocumentSystemType } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env.local for test user credentials
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/*
Complete seed data is used to populate the database with comprehensive initial data for development and testing.
*/

// Initial data imports
import moduleData from "../initial-data/system_Modules_Enabled.json";
import gptModelsDataRaw from "../initial-data/gpt_Models.json";
import crmOpportunityTypeData from "../initial-data/crm_Opportunities_Type.json";
import crmOpportunitySaleStagesData from "../initial-data/crm_Opportunities_Sales_Stages.json";
import crmCampaignsData from "../initial-data/crm_campaigns.json";
import crmIndustryTypeData from "../initial-data/crm_Industry_Type.json";

// Process GPT Models data
const gptModelsData = gptModelsDataRaw.map((item) => ({
  ...item,
  status: item.status as gptStatus,
}));

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("-------- Seeding DB with complete data --------");

  // Seed System Modules Enabled
  const modules = await prisma.system_Modules_Enabled.findMany();
  if (modules.length === 0) {
    await prisma.system_Modules_Enabled.createMany({
      data: moduleData,
    });
    console.log("Modules seeded successfully");
  } else {
    console.log("Modules already seeded");
  }

  // Seed CRM Opportunity Types
  const crmOpportunityType = await prisma.crm_Opportunities_Type.findMany();
  if (crmOpportunityType.length === 0) {
    await prisma.crm_Opportunities_Type.createMany({
      data: crmOpportunityTypeData,
    });
    console.log("Opportunity Types seeded successfully");
  } else {
    console.log("Opportunity Types already seeded");
  }

  // Seed CRM Opportunity Sales Stages
  const crmOpportunitySaleStages = await prisma.crm_Opportunities_Sales_Stages.findMany();
  if (crmOpportunitySaleStages.length === 0) {
    await prisma.crm_Opportunities_Sales_Stages.createMany({
      data: crmOpportunitySaleStagesData,
    });
    console.log("Opportunity Sales Stages seeded successfully");
  } else {
    console.log("Opportunity Sales Stages already seeded");
  }

  // Seed CRM Campaigns
  const crmCampaigns = await prisma.crm_campaigns.findMany();
  if (crmCampaigns.length === 0) {
    await prisma.crm_campaigns.createMany({
      data: crmCampaignsData,
    });
    console.log("Campaigns seeded successfully");
  } else {
    console.log("Campaigns already seeded");
  }

  // Seed CRM Industry Types
  const crmIndustryType = await prisma.crm_Industry_Type.findMany();
  if (crmIndustryType.length === 0) {
    await prisma.crm_Industry_Type.createMany({
      data: crmIndustryTypeData,
    });
    console.log("Industry Types seeded successfully");
  } else {
    console.log("Industry Types already seeded");
  }

  // Seed GPT Models
  const gptModels = await prisma.gpt_models.findMany();
  if (gptModels.length === 0) {
    await prisma.gpt_models.createMany({
      data: gptModelsData,
    });
    console.log("GPT Models seeded successfully");
  } else {
    console.log("GPT Models already seeded");
  }

  // Seed additional Industry Types if not present
  const existingIndustries = await prisma.crm_Industry_Type.findMany();
  let industryIds: string[] = [];
  if (existingIndustries.length <= crmIndustryTypeData.length) {
    const additionalIndustries = [
      { name: "Travel & Tourism", description: "Airlines, hotels, tour operators" },
      { name: "Hospitality", description: "Hotels, restaurants, resorts" },
      { name: "Telecommunications", description: "Network providers, mobile services" },
      { name: "Energy", description: "Oil, gas, renewable energy" },
      { name: "Mining", description: "Resource extraction and processing" },
      { name: "Agriculture", description: "Farming, agribusiness" },
      { name: "Construction", description: "Building, infrastructure" },
      { name: "Media", description: "Broadcasting, publishing, digital media" },
      { name: "Transportation", description: "Shipping, logistics, freight" },
      { name: "Pharmaceuticals", description: "Drug manufacturers, distributors" },
      { name: "Insurance", description: "Life, health, property insurance" },
      { name: "Automotive", description: "Vehicle manufacturers, dealers" },
      { name: "Food & Beverage", description: "Restaurants, beverage producers" },
      { name: "Entertainment", description: "Movies, music, gaming" },
      { name: "Non-profit", description: "Charitable organizations" },
    ];

    for (const industry of additionalIndustries) {
      const existing = existingIndustries.find(i => i.name === industry.name);
      if (!existing) {
        const newIndustry = await prisma.crm_Industry_Type.create({
          data: {
            name: industry.name,
            description: industry.description,
          }
        });
        industryIds.push(newIndustry.id);
      }
    }
    console.log("Additional industries created");
  } else {
    industryIds = existingIndustries.map(i => i.id);
  }

  // Seed Accounts
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
        description: "Flag carrier airline of Ethiopia",
        website: "https://www.ethiopianairlines.com",
        fax: "+251-11-517-4001",
        vat: "ET123456789",
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
        description: "Largest bank in Ethiopia",
        website: "https://www.cbe.com.et",
        fax: "+251-11-555-1235",
        vat: "ET987654321",
      },
      {
        name: "Safaricom PLC",
        email: "info@safaricom.co.ke",
        office_phone: "+254-20-326-0000",
        industry: industryIds[8], // Telecommunications
        employees: "5000+",
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
        industry: industryIds[6], // Education
        employees: "5000+",
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
        industry: industryIds[5], // Travel & Tourism
        employees: "50+",
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
        industry: industryIds[10], // Mining
        employees: "2000+",
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
        industry: industryIds[2], // Finance
        employees: "3000+",
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
        industry: industryIds[7], // Hospitality
        employees: "400+",
        annual_revenue: "200000000",
        billing_city: "Addis Ababa",
        billing_country: "Ethiopia",
        status: "Active",
        type: "Partner",
        description: "Luxury hotel in Addis Ababa",
        website: "https://www.hilton.com/addisababa",
        fax: "+251-11-123-4568",
        vat: "ET147258369",
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
          website: account.website,
          fax: account.fax,
          vat: account.vat,
          billing_state: "Addis Ababa",
          billing_street: "Bole Road",
          shipping_city: account.billing_city,
          shipping_country: account.billing_country,
          shipping_state: "Addis Ababa",
          shipping_street: "Bole Road",
        }
      });
    }
    console.log("Sample accounts created");
  }

  // Get account IDs for referencing
  const accounts = await prisma.crm_Accounts.findMany();
  const accountIds = accounts.map(a => a.id);

  // Seed Contacts
  const existingContacts = await prisma.crm_Contacts.findMany();
  if (existingContacts.length === 0) {
    const sampleContacts = [
      {
        first_name: "Alem",
        last_name: "Tadesse",
        email: "alem.tadesse@ethiopianairlines.com",
        office_phone: "+251-11-517-4001",
        position: "Director of Operations",
        account: accountIds[0], // Ethiopian Airlines
        type: "Customer" as crmContactType,
        status: true,
        description: "Operations head for Ethiopian Airlines",
        personal_email: "alem.personal@email.com",
        mobile_phone: "+251-911-222-333",
        birthday: "1980-05-15",
        social_twitter: "@alem_t",
        social_facebook: "alem.tadesse",
        social_linkedin: "alem-tadesse",
        tags: ["VIP", "Operations", "Travel"],
        notes: ["Has been with company for 15 years", "Decision maker for travel contracts"]
      },
      {
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@cbe.com.et",
        office_phone: "+251-11-555-1235",
        position: "Head of Digital Banking",
        account: accountIds[1], // Commercial Bank of Ethiopia
        type: "Customer" as crmContactType,
        status: true,
        description: "Digital banking head at CBE",
        personal_email: "sarah.j.personal@email.com",
        mobile_phone: "+251-911-333-444",
        birthday: "1985-08-22",
        social_twitter: "@sarah_j",
        social_facebook: "sarah.johnson",
        social_linkedin: "sarah-johnson",
        tags: ["VIP", "Digital", "Finance"],
        notes: ["Influencer in digital transformation initiatives"]
      },
      {
        first_name: "Michael",
        last_name: "Omondi",
        email: "michael.omondi@safaricom.co.ke",
        office_phone: "+254-20-326-0001",
        position: "VP of Partnerships",
        account: accountIds[2], // Safaricom
        type: "Partner" as crmContactType,
        status: true,
        description: "Partnership head at Safaricom",
        personal_email: "michael.personal@email.com",
        mobile_phone: "+254-711-123-456",
        birthday: "1978-12-03",
        social_twitter: "@mike_o",
        social_facebook: "michael.omondi",
        social_linkedin: "michael-omondi",
        tags: ["Partnerships", "Technology", "East Africa"],
        notes: ["Key contact for East African partnerships"]
      },
      {
        first_name: "Dr. Yared",
        last_name: "Mulugeta",
        email: "yared.mulugeta@aau.edu.et",
        office_phone: "+251-11-122-4402",
        position: "Dean of Engineering",
        account: accountIds[3], // Addis Ababa University
        type: "Customer" as crmContactType,
        status: true,
        description: "Dean of Engineering faculty",
        personal_email: "yared.personal@email.com",
        mobile_phone: "+251-911-444-555",
        birthday: "1975-02-10",
        social_twitter: "@dr_yared",
        social_facebook: "yared.mulugeta",
        social_linkedin: "dr-yared-mulugeta",
        tags: ["Academia", "Engineering", "Education"],
        notes: ["Lead researcher in sustainable technologies"]
      },
      {
        first_name: "Abel",
        last_name: "Berhanu",
        email: "abel.berhanu@yuyana.com",
        office_phone: "+251-922-106-901",
        position: "CEO",
        account: accountIds[4], // Yuyana Travel & Tours
        type: "Customer" as crmContactType,
        status: true,
        description: "Chief Executive Officer",
        personal_email: "abel.personal@email.com",
        mobile_phone: "+251-911-555-666",
        birthday: "1982-07-18",
        social_twitter: "@abel_b",
        social_facebook: "abel.berhanu",
        social_linkedin: "abel-berhanu",
        tags: ["VIP", "CEO", "Travel"],
        notes: ["Founder and CEO of Yuyana Travel"]
      },
      {
        first_name: "Grace",
        last_name: "Woldemariam",
        email: "grace.w@metagold.com.et",
        office_phone: "+251-11-111-2224",
        position: "Operations Manager",
        account: accountIds[5], // MetaGold International
        type: "Vendor" as crmContactType,
        status: true,
        description: "Operations manager at mining company",
        personal_email: "grace.personal@email.com",
        mobile_phone: "+251-911-666-777",
        birthday: "1983-11-05",
        social_twitter: "@grace_w",
        social_facebook: "grace.woldemariam",
        social_linkedin: "grace-woldemariam",
        tags: ["Operations", "Mining", "Supply Chain"],
        notes: ["Handles procurement and supply chain"]
      },
      {
        first_name: "David",
        last_name: "Kebede",
        email: "david.k@dashenbank.com.et",
        office_phone: "+251-11-666-7779",
        position: "Corporate Banking Director",
        account: accountIds[6], // Dashen Bank
        type: "Customer" as crmContactType,
        status: true,
        description: "Director of corporate banking",
        personal_email: "david.personal@email.com",
        mobile_phone: "+251-911-777-888",
        birthday: "1979-03-25",
        social_twitter: "@david_k",
        social_facebook: "david.kebede",
        social_linkedin: "david-kebede",
        tags: ["Banking", "Corporate", "Finance"],
        notes: ["Manages corporate client relationships"]
      },
      {
        first_name: "Maria",
        last_name: "Girma",
        email: "maria.g@hiltonaddisababa.com",
        office_phone: "+251-11-123-4569",
        position: "Sales Director",
        account: accountIds[7], // Hilton Addis Ababa
        type: "Partner" as crmContactType,
        status: true,
        description: "Director of sales and marketing",
        personal_email: "maria.personal@email.com",
        mobile_phone: "+251-911-888-999",
        birthday: "1986-09-12",
        social_twitter: "@maria_g",
        social_facebook: "maria.girma",
        social_linkedin: "maria-girma",
        tags: ["Hospitality", "Sales", "Partnership"],
        notes: ["Handles group bookings and partnerships"]
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
          description: contact.description,
          personal_email: contact.personal_email,
          mobile_phone: contact.mobile_phone,
          birthday: contact.birthday,
          social_twitter: contact.social_twitter,
          social_facebook: contact.social_facebook,
          social_linkedin: contact.social_linkedin,
          tags: contact.tags,
          notes: contact.notes,
        }
      });
    }
    console.log("Sample contacts created");
  }

  // Get contact IDs for referencing
  const contacts = await prisma.crm_Contacts.findMany();
  const contactIds = contacts.map(c => c.id);

  // Seed Leads
  const existingLeads = await prisma.crm_Leads.findMany();
  if (existingLeads.length === 0) {
    const campaigns = await prisma.crm_campaigns.findMany();
    const campaignIds = campaigns.map(c => c.id);
    
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
        campaign: campaignIds[0], // Trade Show campaign
        status: "QUALIFIED" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4], // Yuyana Travel & Tours
        refered_by: "Travel Expo 2024",
      },
      {
        firstName: "Kiros",
        last_name: "Haile",
        company: "Blue Nile Tours",
        jobTitle: "Operations Director",
        email: "k.haile@blueniletours.et",
        phone: "+251-11-234-5678",
        description: "Looking for group tour management solutions",
        lead_source: "Referral",
        campaign: campaignIds[2], // Referral Program
        status: "NEW" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4], // Yuyana Travel & Tours
        refered_by: "Abel Berhanu",
      },
      {
        firstName: "Selam",
        last_name: "Tekle",
        company: "Ethiopian Ministry of Tourism",
        jobTitle: "Director",
        email: "s.tekle@tourism.gov.et",
        phone: "+251-11-345-6789",
        description: "Government partnership inquiry",
        lead_source: "Direct Mail",
        campaign: campaignIds[4], // Direct Mail
        status: "CONTACTED" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4], // Yuyana Travel & Tours
        refered_by: "Government Contact",
      },
      {
        firstName: "Samuel",
        last_name: "Asfaw",
        company: "Red Sea Tourism",
        jobTitle: "CEO",
        email: "samuel.asfaw@redseatourism.com",
        phone: "+251-911-999-888",
        description: "Interest in luxury travel packages",
        lead_source: "Website",
        campaign: campaignIds[3], // Email Marketing
        status: "NEW" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4], // Yuyana Travel & Tours
        refered_by: "Website Inquiry",
      },
      {
        firstName: "Leyla",
        last_name: "Mohammed",
        company: "Adama Hotels Group",
        jobTitle: "Revenue Manager",
        email: "leyla.m@adamahotels.com",
        phone: "+251-11-456-7890",
        description: "Seeking corporate travel solutions",
        lead_source: "LinkedIn",
        campaign: campaignIds[4], // Direct Mail
        status: "QUALIFIED" as crmLeadStatus,
        type: "DEMO" as crmLeadType,
        accountsIDs: accountIds[4], // Yuyana Travel & Tours
        refered_by: "LinkedIn Connection",
         // Abel Berhanu
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
          accountsIDs: lead.accountsIDs,
          refered_by: lead.refered_by,
          
        }
      });
    }
    console.log("Sample leads created");
  }

  // Get lead IDs for referencing
  const leads = await prisma.crm_Leads.findMany();
  const leadIds = leads.map(l => l.id);

  // Seed Opportunities
  const existingOpportunities = await prisma.crm_Opportunities.findMany();
  if (existingOpportunities.length === 0) {
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
        currency: "USD",
        next_step: "Finalize contract terms",
        created_by: contactIds[4], // Abel Berhanu
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
        currency: "USD",
        next_step: "Prepare proposal document",
        created_by: contactIds[4], // Abel Berhanu
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
        currency: "USD",
        next_step: "Sign partnership agreement",
        created_by: contactIds[4], // Abel Berhanu
      },
      {
        name: "Government Tourism Initiative",
        account: accountIds[4], // Yuyana Travel & Tours
        contact: contactIds[4], // Abel Berhanu
        campaign: campaignIds[4], // Direct Mail
        sales_stage: stageIds[0], // Lead Qualification (10% probability)
        type: typeIds[0], // New Business
        status: "ACTIVE" as crmOpportunityStatus,
        expected_revenue: 1000000,
        close_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        description: "Large-scale tourism promotion project with government",
        budget: 1200000,
        currency: "USD",
        next_step: "Schedule initial meeting",
        created_by: contactIds[4], // Abel Berhanu
      },
      {
        name: "Corporate Event Planning",
        account: accountIds[6], // Dashen Bank
        contact: contactIds[6], // David Kebede
        campaign: campaignIds[3], // Email Marketing
        sales_stage: stageIds[4], // Closed Won (100% probability)
        type: typeIds[2], // Renewal
        status: "ACTIVE" as crmOpportunityStatus,
        expected_revenue: 75000,
        close_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        description: "Annual corporate retreat planning",
        budget: 80000,
        currency: "USD",
        next_step: "Execute event plan",
        created_by: contactIds[4], // Abel Berhanu
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
          currency: opportunity.currency,
          next_step: opportunity.next_step,
          created_by: opportunity.created_by,
        }
      });
    }
    console.log("Sample opportunities created");
  }

  // Get opportunity IDs for referencing
  const opportunities = await prisma.crm_Opportunities.findMany();
  const opportunityIds = opportunities.map(o => o.id);

  // Seed Contracts
  const existingContracts = await prisma.crm_Contracts.findMany();
  if (existingContracts.length === 0) {
    const sampleContracts = [
      {
        title: "Corporate Travel Services Agreement",
        value: 300000,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        account: accountIds[0], // Ethiopian Airlines
        status: "INPROGRESS" as crmContractsStatus,
        description: "Annual corporate travel services agreement",
        type: "Service",
        customerSignedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        companySignedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        renewalReminderDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Educational Partnership Contract",
        value: 150000,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        account: accountIds[3], // Addis Ababa University
        status: "SIGNED" as crmContractsStatus,
        description: "Student exchange program agreement",
        type: "Partnership",
        customerSignedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        companySignedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        renewalReminderDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Tour Operator Service Contract",
        value: 200000,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endDate: new Date(Date.now() + 360 * 24 * 60 * 60 * 1000), // 360 days from now
        account: accountIds[4], // Yuyana Travel & Tours
        status: "SIGNED" as crmContractsStatus,
        description: "Expanded tour services contract",
        type: "Service",
        customerSignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        companySignedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        renewalReminderDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Government Tourism Partnership",
        value: 500000,
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years from now
        account: accountIds[4], // Yuyana Travel & Tours
        status: "NOTSTARTED" as crmContractsStatus,
        description: "Multi-year tourism promotion partnership with government",
        type: "Partnership",
        renewalReminderDate: new Date(Date.now() + 700 * 24 * 60 * 60 * 1000),
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
          type: contract.type,
          customerSignedDate: contract.customerSignedDate,
          companySignedDate: contract.companySignedDate,
          renewalReminderDate: contract.renewalReminderDate,
        }
      });
    }
    console.log("Sample contracts created");
  }

  // Seed Boards (for projects module)
  const existingBoards = await prisma.Boards.findMany();
  if (existingBoards.length === 0) {
    const sampleBoards = [
      {
        title: "Q2 Tourism Campaign",
        description: "Planning and execution of Q2 marketing campaign",
        icon: "📅",
        position: 1,
        user: contactIds[4], // Abel Berhanu
        visibility: "Public",
      },
      {
        title: "New Destination Launch",
        description: "Launch preparation for new tour destinations",
        icon: "🗺️",
        position: 2,
        user: contactIds[4], // Abel Berhanu
        visibility: "Private",
      },
      {
        title: "Partnership Development",
        description: "Managing new partnership opportunities",
        icon: "🤝",
        position: 3,
        user: contactIds[4], // Abel Berhanu
        visibility: "Team",
      }
    ];

    for (const board of sampleBoards) {
      await prisma.Boards.create({
        data: {
          title: board.title,
          description: board.description,
          icon: board.icon,
          position: board.position,
          user: board.user,
          visibility: board.visibility,
          favourite: true,
        }
      });
    }
    console.log("Sample boards created");
  }

  // Seed Invoices
  const existingInvoices = await prisma.Invoices.findMany();
  if (existingInvoices.length === 0) {
    const sampleInvoices = [
      {
        date_created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        date_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: "Corporate travel services - January",
        invoice_number: "INV-2024-001",
        invoice_amount: "35000.00",
        partner: "Ethiopian Airlines",
        status: "Paid",
        assigned_user_id: contactIds[4],
        assigned_account_id: accountIds[0],
        invoice_type: "Service",
        invoice_currency: "USD",
        partner_email: "alem.tadesse@ethiopianairlines.com",
        partner_phone_number: "+251-11-517-4001",
      },
      {
        date_created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        date_due: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        description: "Event planning services",
        invoice_number: "INV-2024-002",
        invoice_amount: "15000.00",
        partner: "Dashen Bank",
        status: "Pending",
        assigned_user_id: contactIds[4],
        assigned_account_id: accountIds[6],
        invoice_type: "Service",
        invoice_currency: "USD",
        partner_email: "david.k@dashenbank.com.et",
        partner_phone_number: "+251-11-666-7779",
      },
      {
        date_created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        date_due: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        description: "Tour package booking",
        invoice_number: "INV-2024-003",
        invoice_amount: "8500.00",
        partner: "Hotel Sky",
        status: "Sent",
        assigned_user_id: contactIds[4],
        assigned_account_id: accountIds[4],
        invoice_type: "Product",
        invoice_currency: "USD",
        partner_email: "h.bekele@hotelsky.et",
        partner_phone_number: "+251-11-123-4567",
      }
    ];

    for (const invoice of sampleInvoices) {
      await prisma.Invoices.create({
        data: {
          date_created: invoice.date_created,
          last_updated: invoice.last_updated,
          date_due: invoice.date_due,
          description: invoice.description,
          invoice_number: invoice.invoice_number,
          invoice_amount: invoice.invoice_amount,
          partner: invoice.partner,
          status: invoice.status,
          assigned_user_id: invoice.assigned_user_id,
          assigned_account_id: invoice.assigned_account_id,
          invoice_type: invoice.invoice_type,
          invoice_currency: invoice.invoice_currency,
          partner_email: invoice.partner_email,
          partner_phone_number: invoice.partner_phone_number,
          favorite: false,
          visibility: true,
        }
      });
    }
    console.log("Sample invoices created");
  }

  // Seed Documents
  const existingDocuments = await prisma.Documents.findMany();
  if (existingDocuments.length === 0) {
    const sampleDocuments = [
      {
        name: "Corporate Travel Agreement",
        description: "Annual corporate travel services contract",
        document_type: "Contract",
        document_system_type: "CONTRACT" as DocumentSystemType,
        assigned_user: contactIds[4],
        created_by_user: contactIds[4],
        status: "Active",
        visibility: "Private",
        document_url: "/documents/corporate-travel-agreement.pdf",
        file_size: "2.4 MB",
        uploaded_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        shared_with: [contactIds[0]], // Shared with Alem Tadesse
      },
      {
        name: "Tour Package Brochure",
        description: "Brochure for new tour packages",
        document_type: "Marketing Material",
        document_system_type: "OTHER" as DocumentSystemType,
        assigned_user: contactIds[4],
        created_by_user: contactIds[4],
        status: "Active",
        visibility: "Public",
        document_url: "/documents/tour-package-brochure.pdf",
        file_size: "5.1 MB",
        uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        shared_with: [],
      },
      {
        name: "Financial Report Q1",
        description: "Quarterly financial performance report",
        document_type: "Report",
        document_system_type: "OTHER" as DocumentSystemType,
        assigned_user: contactIds[4],
        created_by_user: contactIds[4],
        status: "Active",
        visibility: "Team",
        document_url: "/documents/q1-financial-report.pdf",
        file_size: "3.2 MB",
        uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        shared_with: [contactIds[6]], // Shared with David Kebede
      }
    ];

    for (const document of sampleDocuments) {
      await prisma.Documents.create({
        data: {
          name: document.name,
          description: document.description,
          document_type: document.document_type,
          document_system_type: document.document_system_type,
          assigned_user: document.assigned_user,
          created_by_user: document.created_by_user,
          status: document.status,
          visibility: document.visibility,
          document_url: document.document_url,
          file_size: document.file_size,
          uploaded_at: document.uploaded_at,
          shared_with: document.shared_with,
          favorite: true,
        }
      });
    }
    console.log("Sample documents created");
  }

  // Seed Employees
  const existingEmployees = await prisma.Employees.findMany();
  if (existingEmployees.length === 0) {
    const sampleEmployees = [
      {
        name: "Abel Berhanu",
        email: "abel.berhanu@yuyana.com",
        salary: 85000,
        status: "Active",
        avatar: "/avatars/abel-berhanu.jpg",
      },
      {
        name: "Hirut Bekele",
        email: "hirut.bekele@yuyana.com",
        salary: 65000,
        status: "Active",
        avatar: "/avatars/hirut-bekele.jpg",
      },
      {
        name: "Kiros Haile",
        email: "kiros.haile@yuyana.com",
        salary: 70000,
        status: "Active",
        avatar: "/avatars/kiros-haile.jpg",
      },
      {
        name: "Selam Tekle",
        email: "selam.tekle@yuyana.com",
        salary: 60000,
        status: "On Leave",
        avatar: "/avatars/selam-tekle.jpg",
      },
      {
        name: "Samuel Asfaw",
        email: "samuel.asfaw@yuyana.com",
        salary: 75000,
        status: "Active",
        avatar: "/avatars/samuel-asfaw.jpg",
      }
    ];

    for (const employee of sampleEmployees) {
      await prisma.Employees.create({
        data: {
          name: employee.name,
          email: employee.email,
          salary: employee.salary,
          status: employee.status,
          avatar: employee.avatar,
          v: 0,
        }
      });
    }
    console.log("Sample employees created");
  }

  // Seed Test User for E2E Testing
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

  // Seed additional sample users
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
    },
    {
      email: "support@yuyana-crm.test",
      name: "Customer Support",
      password: "SupportPass123!",
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

  console.log("-------- Complete seed DB completed --------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });