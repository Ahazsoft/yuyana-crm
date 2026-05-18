import { Suspense } from "react";

import SuspenseLoading from "@/components/loadings/suspense";

import Container from "../../components/ui/Container";
import LeadsView from "../components/LeadsView";

import { getAllCrmData } from "@/actions/crm/get-crm-data";
import {
  getLeads,
  getArchivedLeads,
  getMyOwnLeads,
  getMyOwnArchivedLeads,
} from "@/actions/crm/get-leads";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const LeadsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const leads = await getLeads();
  const archivedLeads = await getArchivedLeads();
  const myleads = await getMyOwnLeads();
  const myarchivedLeads = await getMyOwnArchivedLeads();
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session?.user.role === "ADMIN";


  return (
    <Container
      title={t("leads.pageTitle")}
      description={t("leads.pageDescription")}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <LeadsView
          title="Leads"
          crmData={crmData}
          data={isAdmin ? leads : myleads}
        />
      </Suspense>
      <div className="my-5" />
      <Suspense fallback={<SuspenseLoading />}>
        <LeadsView
          title="Archived Leads"
          crmData={crmData}
          data={isAdmin ? archivedLeads : myarchivedLeads}
        />
      </Suspense>
    </Container>
  );
};

export default LeadsPage;
