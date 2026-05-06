import Container from "@/app/[locale]/(routes)/components/ui/Container2";
import { getTranslations } from "next-intl/server";
import getSegmentById from "@/actions/marketing/segments/get-segment";
import SegmentMembersEditor from "@/components/marketing/SegmentMembersEditor";
import SegmentBulkUpload from "@/components/marketing/SegmentBulkUpload";

const SegmentViewPage = async ({
  params,
}: {
  params: Promise<{ segmentId: string }>;
}) => {
  const t = await getTranslations("ModuleMenu.marketing");
  const { segmentId } = await params;
  const seg = await getSegmentById(segmentId);

  if (!seg) {
    return (
      <Container
        title="Segment Not Found"
        description="The requested segment could not be found"
        buttonText="Back"
        buttonHref="/marketing/segments"
      >
        <div className="p-6 text-sm text-muted-foreground">
          Segment not found
        </div>
      </Container>
    );
  }

  const emails =
    seg.type === "DYNAMIC" &&
    Array.isArray((seg as any).emails) &&
    (seg as any).emails.length > 0
      ? (seg as any).emails
      : (seg.members || []).map((m: any) => m.lead?.email).filter(Boolean);

  return (
    <Container
      title={seg.name}
      description={`Segment (${seg.type})`}
      buttonText="Back"
      buttonHref="/marketing/segments"
    >
      <div className="p-6 space-y-6">
        {/* Email List */}
        {seg.type === "DYNAMIC" && (
          <div className="border rounded-lg bg-background">
            <div className="flex justify-between border-b">
              <div className="px-4 py-3 ">
                <h4 className="text-sm font-semibold">Emails</h4>
                <p className="text-xs text-muted-foreground">
                  Resolved emails in this dynamic segment
                </p>
              </div>
              <div className="text-sm font-semibold px-4 py-3 ">
                Total : {seg.cachedCount ?? emails.length}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {emails.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No emails found
                </div>
              ) : (
                <div className="divide-y">
                  {emails.map((e: string) => (
                    <div
                      key={e}
                      className="px-4 py-2 text-sm font-mono hover:bg-muted/40 transition-colors"
                    >
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border rounded-lg bg-background p-4 space-y-5">
          <div>
            <h4 className="text-sm font-semibold">Manage Members</h4>
            <p className="text-xs text-muted-foreground">
              Add or update segment members
            </p>
          </div>

          <div className="space-y-4">
            <SegmentBulkUpload segmentId={segmentId} />

            <SegmentMembersEditor
              segmentId={segmentId}
              initialEmails={emails}
              isCustom={seg.type === "DYNAMIC"}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SegmentViewPage;
