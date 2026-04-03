import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";

const MarketingTemplatesPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");

  // In the future, we could fetch templates from the database
  const templates = [
    {
      id: "1",
      name: "Newsletter Template",
      description: "Standard newsletter layout",
      usage: 12,
    },
    {
      id: "2",
      name: "Promotional Template",
      description: "For product promotions",
      usage: 8,
    },
    {
      id: "3",
      name: "Welcome Template",
      description: "For new subscriber welcomes",
      usage: 24,
    },
  ];

  return (
    <Container
      title={t("templates")}
      description="Create and manage your email templates"
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Email Templates</h2>
            <p className="text-muted-foreground mt-1">
              Create reusable email templates for your campaigns
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors">
            New Template
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Create Custom Email Templates</h3>
            <p className="text-muted-foreground">
              Customize designs and layouts to match your brand identity and marketing needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                <div className="mt-3 flex items-center text-sm text-muted-foreground">
                  <span>Used: {template.usage} times</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded">
                    Edit
                  </button>
                  <button className="text-xs bg-primary hover:bg-primary/80 text-white px-2 py-1 rounded">
                    Use Template
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

export default MarketingTemplatesPage;