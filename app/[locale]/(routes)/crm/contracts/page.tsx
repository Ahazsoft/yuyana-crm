import React, { Suspense } from "react";
import Container from "../../components/ui/Container";
import SuspenseLoading from "@/components/loadings/suspense";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getContractsWithIncludes } from "@/actions/crm/get-contracts";
import ContractsView from "../components/ContractsView";
import { getTranslations } from "next-intl/server";
import { getContacts } from "@/actions/crm/get-contacts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const ContractsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const contracts = await getContractsWithIncludes();
  const contacts = await getContacts();
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <Container
      title={t("contracts.pageTitle")}
      description={t("contracts.pageDescription")}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <ContractsView crmData={crmData} data={contracts} contacts={contacts} />
      </Suspense>
    </Container>
  );
};

export default ContractsPage;
