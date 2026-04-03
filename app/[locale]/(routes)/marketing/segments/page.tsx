import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";

const MarketingSegmentsPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");

  // Mock data for segments
  const segments = [
    {
      id: "1",
      name: "VIP Customers",
      description: "High-value customers who spend over $500",
      count: 245,
      conversionRate: 12.5,
    },
    {
      id: "2",
      name: "New Subscribers",
      description: "Customers who joined in the last 30 days",
      count: 1200,
      conversionRate: 8.2,
    },
    {
      id: "3",
      name: "Inactive Users",
      description: "Users who haven't purchased in 6 months",
      count: 3500,
      conversionRate: 3.1,
    },
  ];

  return (
    <Container
      title="Customer Segments"
      description="Create and manage audience segments for targeted campaigns"
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Customer Segments</h2>
            <p className="text-muted-foreground mt-1">
              Organize your audience into targeted groups for personalized campaigns
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors">
            New Segment
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Target Your Audience</h3>
            <p className="text-muted-foreground">
              Create customer segments based on behavior, demographics, and purchase history
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <div key={segment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{segment.name}</h3>
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {segment.count} members
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Conv. Rate:</span>
                    <span className="font-medium">{segment.conversionRate}%</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded">
                    Edit
                  </button>
                  <button className="text-xs bg-primary hover:bg-primary/80 text-white px-2 py-1 rounded">
                    Use in Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default MarketingSegmentsPage;