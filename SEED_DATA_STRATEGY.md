# Seed Data Strategy for yuyana-crm

This document outlines the comprehensive seed data strategy for the yuyana-crm project, providing realistic sample data for development, testing, and demonstration purposes.

## Overview

The seed data strategy includes comprehensive initialization for all major entities in the CRM system, with realistic examples focused on the Ethiopian tourism and business landscape, particularly around the Yuyana Travel & Tours business.

## Seed Files

### 1. Original Seed File
- **Location**: `prisma/seeds/seed.ts`
- **Purpose**: Basic seed data for configuration entities like modules, CRM types, sales stages, etc.
- **Usage**: Used during standard database seeding

### 2. Complete Seed File
- **Location**: `prisma/seeds/complete-seed.ts`
- **Purpose**: Comprehensive seed data for all entities with realistic sample data
- **Usage**: For development and testing environments requiring full dataset

### 3. Full Seed File
- **Location**: `prisma/seeds/full-seed.ts`
- **Purpose**: Extended seed data with additional sample records
- **Usage**: Alternative seed with moderate amount of sample data

## Data Categories Seeded

### System Configuration
- System modules enabled/disabled states
- GPT models with status
- CRM configuration data:
  - Opportunity types
  - Sales stages with probabilities
  - Marketing campaigns
  - Industry types

### Business Entities
- **Accounts**: Companies and organizations with industry classification, contact info, etc.
- **Contacts**: Individuals associated with accounts, with positions, contact details, social profiles
- **Leads**: Prospects in the sales funnel with source, status, and assignment
- **Opportunities**: Sales opportunities with values, stages, and expected close dates
- **Contracts**: Legal agreements with start/end dates, values, and status
- **Invoices**: Financial documents with amounts, due dates, and status
- **Documents**: Files and attachments with sharing permissions
- **Employees**: Staff members with details and compensation

### Projects and Tasks
- **Boards**: Kanban-style project organization
- **Tasks**: Individual work items with assignments and status

## Sample Data Strategy

The seed data follows these principles:

1. **Realistic Context**: Focused on Ethiopian tourism and business environment
2. **Complete Relationships**: Properly connected entities with foreign key references
3. **Diverse Statuses**: Various stages of completion and activity for realistic testing
4. **Comprehensive Coverage**: All major entities in the system are populated
5. **Role-Based Users**: Different user types with appropriate permissions

### Key Sample Organizations
- Ethiopian Airlines (major customer)
- Commercial Bank of Ethiopia (financial sector)
- Safaricom (telecom sector)
- Addis Ababa University (education)
- Yuyana Travel & Tours (primary target business)
- Various hotels, banks, and government agencies

## Usage Instructions

### For Fresh Database Setup
```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Seed with complete dataset
pnpm prisma db seed
```

### For Adding Seed Data to Existing Database
```bash
# Run the complete seed directly
npx tsx prisma/seeds/complete-seed.ts
```

### For Resetting Database Completely
```bash
# Wipe and recreate database with schema and seed data
pnpm prisma migrate reset
```

## Customization

To customize the seed data for specific needs:

1. Modify the JSON files in `prisma/initial-data/` for basic configuration data
2. Update the `complete-seed.ts` file for business entities
3. Add new seed files for specialized testing scenarios

## Testing Considerations

The seed data is designed to support various testing scenarios:
- Sales pipeline progression
- Multi-user collaboration
- Reporting and analytics
- Permission-based access control
- Integration workflows
- Data validation and constraints

## Maintaining Consistency

When adding new entities to the schema:
1. Update the seed files to include appropriate sample data
2. Ensure referential integrity is maintained
3. Add realistic sample records that demonstrate the entity's purpose
4. Update this documentation as needed

## Troubleshooting

If seed operations fail:
1. Ensure your database connection is configured correctly in `.env`
2. Verify that all referenced foreign keys exist
3. Check that enum values match defined types
4. Confirm that required fields are populated

For questions about the seed data strategy, consult the development team or update this document as needed.