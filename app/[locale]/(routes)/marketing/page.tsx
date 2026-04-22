import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MarketingDashboardPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");

  // Mock data for dashboard
  const metrics = {
    totalCampaigns: 12,
    activeCampaigns: 4,
    totalSent: 42850,
    totalOpens: 10285,
    totalClicks: 1842,
    totalConversions: 342,
  };

  const recentCampaigns = [
    { id: "1", name: "Summer Sale Campaign", status: "Active", sent: 12500, openRate: "24.5%" },
    { id: "2", name: "New Product Launch", status: "Completed", sent: 8200, openRate: "28.7%" },
    { id: "3", name: "Customer Retention", status: "Paused", sent: 5600, openRate: "18.2%" },
  ];

  return (
    <Container
      title={t("title")}
      description="Overview of your marketing activities and performance"
    >
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Marketing Overview</h2>
          <p className="text-muted-foreground">
            Key metrics and recent activity from your marketing campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalConversions}</div>
              <p className="text-xs text-muted-foreground">From marketing efforts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{campaign.sent.toLocaleString()} sent</p>
                      <p className="text-sm text-muted-foreground">{campaign.openRate} open rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Email Opens</span>
                    <span>{(metrics.totalOpens / metrics.totalSent * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${metrics.totalOpens / metrics.totalSent * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Click Through</span>
                    <span>{(metrics.totalClicks / metrics.totalOpens * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${metrics.totalClicks / metrics.totalOpens * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Conversion Rate</span>
                    <span>{(metrics.totalConversions / metrics.totalClicks * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${metrics.totalConversions / metrics.totalClicks * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default MarketingDashboardPage;