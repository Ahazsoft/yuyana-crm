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
    },
  });
  return seg;
};

export default createSegment;
