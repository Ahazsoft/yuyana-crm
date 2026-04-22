import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getMarketingCampaigns } from "@/actions/marketing/get-marketing-campaigns";
import { getMarketingTemplates } from "@/actions/marketing/get-marketing-templates";
import CampaignsView from "./components/CampaignsView";
import SuspenseLoading from "@/components/loadings/suspense";
import { Suspense } from "react";

const MarketingCampaignsPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  const campaigns = await getMarketingCampaigns();
  const templates = await getMarketingTemplates();

  return (
    <Container
      title="Marketing Campaigns"
      description="Create and manage your marketing campaigns"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <CampaignsView campaigns={campaigns} templates={templates} />
      </Suspense>
    </Container>
  );
};

export default MarketingCampaignsPage;
