import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";

const MarketingUserDashboardPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");

  // Mock data for user dashboard
  const metrics = {
    campaignsOwned: 5,
    campaignsParticipated: 8,
    completedCampaigns: 3,
    pendingCampaigns: 2,
    totalOpens: 1250,
    totalClicks: 320,
  };

  const recentActivity = [
    { id: "1", action: "Created new campaign", item: "Summer Sale", date: "2 hours ago" },
    { id: "2", action: "Updated segment", item: "VIP Customers", date: "Yesterday" },
    { id: "3", action: "Sent analytics report", item: "Monthly Performance", date: "2 days ago" },
  ];

  return (
    <Container
      title="My Marketing Dashboard"
      description="Personalized overview of your marketing activities"
    >
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Marketing Dashboard</h2>
          <p className="text-muted-foreground">
            Your personalized view of marketing activities and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Campaigns Owned</h3>
            <p className="text-2xl font-bold mt-2">{metrics.campaignsOwned}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Campaigns Participated</h3>
            <p className="text-2xl font-bold mt-2">{metrics.campaignsParticipated}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Completed</h3>
            <p className="text-2xl font-bold mt-2">{metrics.completedCampaigns}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Pending</h3>
            <p className="text-2xl font-bold mt-2">{metrics.pendingCampaigns}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Total Opens</h3>
            <p className="text-2xl font-bold mt-2">{metrics.totalOpens}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Total Clicks</h3>
            <p className="text-2xl font-bold mt-2">{metrics.totalClicks}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 border-b">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default MarketingUserDashboardPage;