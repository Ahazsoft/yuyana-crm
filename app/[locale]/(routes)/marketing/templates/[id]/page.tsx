import { getMarketingTemplate } from "@/actions/marketing/get-marketing-template";
import TemplateEditForm from "@/components/marketing/TemplateEditForm";

interface Props {
	params: { id: string };
}

const TemplateEditPage = async ({ params }: Props) => {
	// `params` may be a Promise in some Next.js configs — await it safely
	const resolvedParams: any = await params;
	const template = await getMarketingTemplate(resolvedParams.id);

	if (!template) return null;

	return <TemplateEditForm id={resolvedParams.id} initial={template} />;
};

export default TemplateEditPage;

