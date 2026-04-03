import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMarketingCampaign } from "@/actions/marketing/get-marketing-campaign";

const CampaignDetailPage = async ({ params }: { params: { campaignId: string } }) => {
  const t = await getTranslations("ModuleMenu.marketing");
  
  // Fetch actual campaign data
  const campaign = await getMarketingCampaign(params.campaignId);

  if (!campaign) {
    return (
      <Container
        title="Campaign Not Found"
        description="The requested marketing campaign could not be found"
      >
        <div className="p-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">Campaign not found</h3>
            <p className="text-muted-foreground mt-2">The campaign with ID {params.campaignId} does not exist.</p>
            <Button className="mt-4" variant="outline">
              <a href="/marketing/campaigns">Back to Campaigns</a>
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  // Calculate rates
  const openRate = campaign.sentCount ? (campaign.openCount / campaign.sentCount) * 100 : 0;
  const clickRate = campaign.openCount ? (campaign.clickCount / campaign.openCount) * 100 : 0;
  const conversionRate = campaign.clickCount ? (campaign.conversionCount / campaign.clickCount) * 100 : 0;

  return (
    <Container
      title={campaign.name}
      description="Detailed view of your marketing campaign"
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <div className="flex items-center mt-2 space-x-2">
              <Badge 
                variant={
                  campaign.status === "ACTIVE" ? "default" : 
                  campaign.status === "DRAFT" ? "secondary" : 
                  campaign.status === "PAUSED" ? "destructive" : 
                  "outline"
                }
              >
                {campaign.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created by {campaign.createdBy?.name || 'Unknown'} on {campaign.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Edit</Button>
            <Button>Send Now</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p>{campaign.description || 'No description provided'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Schedule</h4>
                <p>
                  {campaign.startDate 
                    ? new Date(campaign.startDate).toLocaleDateString() 
                    : 'Not set'} 
                  {' '} - {' '}
                  {campaign.endDate 
                    ? new Date(campaign.endDate).toLocaleDateString() 
                    : 'Not set'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Target Audience</h4>
                <p>{campaign.targetAudience ? JSON.stringify(campaign.targetAudience) : 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget & Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span>${campaign.budget ? Number(campaign.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span>${campaign.spent ? Number(campaign.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span>
                    ${campaign.budget && campaign.spent 
                      ? (Number(campaign.budget) - Number(campaign.spent)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                      : '0.00'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: campaign.budget && Number(campaign.budget) > 0 
                        ? `${Math.min(100, (Number(campaign.spent || 0) / Number(campaign.budget)) * 100)}%` 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Subject</h4>
                <p>{campaign.emailSubject || 'No subject set'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{campaign.sentCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Sent</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{campaign.openCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Opened</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{campaign.clickCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Clicked</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{campaign.conversionCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Converted</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{openRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Open Rate</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{clickRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Click Rate</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{conversionRate.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default CampaignDetailPage;