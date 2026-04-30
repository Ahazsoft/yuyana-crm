import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";
import SegmentManager from "@/components/marketing/SegmentManager";

const MarketingSegmentsPage = async () => {
  const t = await getTranslations("ModuleMenu.marketing");

  return (
    <Container title="Customer Segments" description="Create and manage audience segments for targeted campaigns">
      <div className="p-6 space-y-6">        
        <div className="border rounded-lg p-6">
          <SegmentManager />
        </div>
      </div>
    </Container>
  );
};

export default MarketingSegmentsPage;