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

const CrmDashboardPage = async () => {
  const salesStages = await getSaleStages();
  const opportunities = await getOpportunities();
  const crmData = await getAllCrmData();
  const t = await getTranslations("CrmPage");
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
