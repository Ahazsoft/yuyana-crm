import { Suspense } from "react";
// import Container from "../components/ui/Container";
import MainPageView from "./components/MainPageView";
import SuspenseLoading from "@/components/loadings/suspense";
import { getTranslations } from "next-intl/server";

// const CrmPage = async () => {
//   const t = await getTranslations("CrmPage");
//   return (
//     <Container
//       title={t("title")}
//       description={t("description")}
//     >
//       {/*
//       TODO: Think about how to handle the loading of the data to make better UX with suspense
//       */}
//       <Suspense fallback={<SuspenseLoading />}>
//         <MainPageView />
//       </Suspense>
//     </Container>
//   );
// };

// export default CrmPage;

import React from "react";
import Container from "../components/ui/Container";
import { getSaleStages } from "@/actions/crm/get-sales-stage";
import CRMKanban from "./dashboard/_components/CRMKanban";
import { getOpportunities } from "@/actions/crm/get-opportunities";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldX, Lock } from "lucide-react";

const CrmDashboardPage = async () => {
  const salesStages = await getSaleStages();
  const opportunities = await getOpportunities();
  const crmData = await getAllCrmData();
  const t = await getTranslations("CrmPage");

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="mx-5 ">
        <Container
          title="CRM Overview"
          description="In development. After this compoment is finished, there will be a optimistic update of the data."
        >
          <div className="flex flex-col items-center justify-center py-12 px-6">
            {/* Icon Container */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-full ring-1 ring-red-200 dark:ring-red-800">
                <ShieldX
                  className="w-16 h-16 text-red-500 dark:text-red-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-3 max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Hello {session.user.name}
              </h2>

              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <p className="text-lg">
                  You're not allowed to access this page.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This page is only available for administrators.
              </p>
            </div>


          </div>
        </Container>
      </div>
    );
  }
  return (
    <div className="mx-5 my-6">
      <Container
        title="CRM Overview"
        description="In development. After this compoment is finished, there will be a optimistic update of the data."
      >
        <div className="w-full h-full  overflow-hidden">
          <CRMKanban
            salesStages={salesStages}
            opportunities={opportunities}
            crmData={crmData}
          />
        </div>
      </Container>
      <hr />
      <div className="mt-6"></div>
      <Container title={""} description={""}>
        {/*
      TODO: Think about how to handle the loading of the data to make better UX with suspense
      */}
        <Suspense fallback={<SuspenseLoading />}>
          <MainPageView />
        </Suspense>
        //{" "}
      </Container>
    </div>
  );
};

export default CrmDashboardPage;
