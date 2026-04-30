import { Suspense } from "react";

import SuspenseLoading from "@/components/loadings/suspense";

import Container from "../../components/ui/Container";
import LeadsView from "../components/LeadsView";

import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getLeads, getArchivedLeads } from "@/actions/crm/get-leads";
import { getTranslations } from "next-intl/server";

const LeadsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const leads = await getLeads();
  const archivedLeads = await getArchivedLeads();

  console.log(leads[0], "leads");
  return (
    <Container
      title={t("leads.pageTitle")}
      description={t("leads.pageDescription")}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <LeadsView title="Leads" crmData={crmData} data={leads} />
      </Suspense>
      <div className="my-5" />
      <Suspense fallback={<SuspenseLoading />}>
        <LeadsView
          title="Archived Leads"
          crmData={crmData}
          data={archivedLeads}
        />
      </Suspense>
    </Container>
  );
};

export default LeadsPage;
