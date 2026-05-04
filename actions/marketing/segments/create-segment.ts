//@ts-nocheck
import { prismadb } from "@/lib/prisma";


type CreateSegmentInput = {
  name: string;
  description?: string;
  type?: "STATIC" | "DYNAMIC";
  segmentationType?: "LEAD" | "ACCOUNT" | "CONTACT";
  leadFilters?: any;
  accountFilters?: any;
  contactFilters?: any;
  ownerId?: string;
  emails?: string[];
};


export const createSegment = async (input: CreateSegmentInput) => {
  const seg = await prismadb.marketingSegment.create({
    data: {
      name: input.name,
      description: input.description,
      type: input.type || "DYNAMIC",
      segmentationType: input.segmentationType ?? null,
      leadFilters: input.leadFilters ?? null,
      accountFilters: input.accountFilters ?? null,
      contactFilters: input.contactFilters ?? null,
      ownerId: input.ownerId ?? null,
      emails: Array.isArray(input.emails) && input.emails.length > 0 && input.type === 'DYNAMIC' ? input.emails : null,
    },
  });
  // If type is DYNAMIC and emails were provided, update cachedCount to reflect email count
  if (Array.isArray(input.emails) && input.emails.length > 0 && input.type === 'DYNAMIC') {
    try {
      const unique = Array.from(new Set(input.emails.map((e) => (e || '').trim().toLowerCase()).filter(Boolean)));
      await prismadb.marketingSegment.update({ where: { id: seg.id }, data: { cachedCount: unique.length } });
    } catch (e) {
      console.log('[UPDATE_SEGMENT_COUNT_ERR]', e);
    }
  }
  return seg;
};

export default createSegment;
