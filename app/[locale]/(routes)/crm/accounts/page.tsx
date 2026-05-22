import React, { Suspense } from "react";

import AccountsView from "../components/AccountsView";
import Container from "../../components/ui/Container";
import SuspenseLoading from "@/components/loadings/suspense";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getAccounts, getMyOwnAccounts } from "@/actions/crm/get-accounts";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const AccountsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const accounts = await getAccounts();
  const myAccounts = await getMyOwnAccounts();
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session?.user.role === "ADMIN";

  return (
    
    <Container
      // title={t("accounts.pageTitle")} 
      title="Companies"
      // description={t("accounts.pageDescription")}
      description="Everything you need to know about your company"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <AccountsView crmData={crmData} data={isAdmin ? accounts : myAccounts} />
      </Suspense>
    </Container>
  );
};

export default AccountsPage;
