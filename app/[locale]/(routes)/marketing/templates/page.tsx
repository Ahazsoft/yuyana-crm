import Container from "@/app/[locale]/(routes)/components/ui/Container2";
import { getTranslations } from "next-intl/server";
import { getMarketingTemplates } from "@/actions/marketing/get-marketing-templates";


// 1. We move the client logic (delete/state) to a separate sub-component
import TemplateCard from "./TemplateCard"; 

const MarketingTemplatesPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");
  const templates = await getMarketingTemplates();

  return (
    <Container
      title={t("templates")}
      description="Create and manage your email templates"
      buttonText="New Template"
      buttonHref="/marketing/templates/new"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template: any) => (
            // Pass the template to our client-side card
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default MarketingTemplatesPage;