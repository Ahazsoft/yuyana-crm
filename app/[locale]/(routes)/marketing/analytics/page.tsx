import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";

const MarketingAnalyticsPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");

  // In the future, we could fetch analytics from the database
  const analyticsData = {
    emailsSent: 2842,
    openRate: 24.5,
    clickRate: 3.2,
    conversions: 86,
  };

  const topCampaigns = [
    { id: "1", name: "Welcome Series", openRate: 32.1, clicks: 124, conversions: 8 },
    { id: "2", name: "Summer Sale", openRate: 28.7, clicks: 342, conversions: 15 },
    { id: "3", name: "New Product Launch", openRate: 25.3, clicks: 287, conversions: 12 },
  ];

  return (
    <Container
      title={t("analytics")}
      description="Track and analyze your marketing performance"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Marketing Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Emails Sent</h3>
            <p className="text-2xl font-bold mt-2">{analyticsData.emailsSent.toLocaleString()}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Open Rate</h3>
            <p className="text-2xl font-bold mt-2">{analyticsData.openRate}%</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Click Rate</h3>
            <p className="text-2xl font-bold mt-2">{analyticsData.clickRate}%</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Conversions</h3>
            <p className="text-2xl font-bold mt-2">{analyticsData.conversions}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-64 bg-muted rounded flex items-center justify-center">
            Chart visualization would go here
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Campaigns</h3>
          <div className="space-y-4">
            {topCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex justify-between items-center p-3 border-b">
                <span>{campaign.name}</span>
                <div className="flex space-x-6">
                  <span className="text-muted-foreground">Open rate: {campaign.openRate}%</span>
                  <span className="text-muted-foreground">Clicks: {campaign.clicks}</span>
                  <span className="text-muted-foreground">Conversions: {campaign.conversions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default MarketingAnalyticsPage;