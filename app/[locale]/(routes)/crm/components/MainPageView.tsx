import React from "react";

import { getAccounts } from "@/actions/crm/get-accounts";
import { getContacts } from "@/actions/crm/get-contacts";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getLeads } from "@/actions/crm/get-leads";
import { getContractsWithIncludes } from "@/actions/crm/get-contracts";
import { getOpportunitiesFull } from "@/actions/crm/get-opportunities-with-includes";

import AccountsView from "./AccountsView";
import ContactsView from "./ContactsView";
import OpportunitiesView from "./OpportunitiesView";
import LeadsView from "./LeadsView";
import ContractsView from "./ContractsView";

const MainPageView = async () => {
  const [crmData, accounts, contacts, opportunities, leads, contracts] =
    await Promise.all([
      getAllCrmData(),
      getAccounts(),
      getContacts(),
      getOpportunitiesFull(),
      getLeads(),
      getContractsWithIncludes(),
    ]);
  return (
    <>
      <AccountsView crmData={crmData} data={accounts} />
      <div className="mt-6"></div>
      <OpportunitiesView crmData={crmData} data={opportunities} />
      <div className="mt-6"></div>
      <ContactsView crmData={crmData} data={contacts} />
      <div className="mt-6"></div>
      <LeadsView title="Leads" crmData={crmData} data={leads} />
      <div className="mt-6"></div>
      <ContractsView crmData={crmData} data={contracts} />
    </>
  );
};

export default MainPageView;
