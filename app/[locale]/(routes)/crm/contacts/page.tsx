import { Suspense } from "react";

import SuspenseLoading from "@/components/loadings/suspense";

import Container from "../../components/ui/Container";
import ContactsView from "../components/ContactsView";
import { getContacts, getMyOwnContacts } from "@/actions/crm/get-contacts";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const AccountsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const contacts = await getContacts();
  const myContacts = await getMyOwnContacts();
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session?.user.role === "ADMIN";

  return (
    <Container
      title={t("contacts.pageTitle")}
      description={t("contacts.pageDescription")}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <ContactsView crmData={crmData} data={isAdmin ? contacts : myContacts} />
      </Suspense>
    </Container>
  );
};

export default AccountsPage;
