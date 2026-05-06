import { prismadb } from "@/lib/prisma";

export const getSegmentById = async (id: string) => {
  const seg = await prismadb.marketingSegment.findUnique({
    where: { id },
    include: { members: { include: { lead: true } } },
  });
  return seg;
};

export default getSegmentById;
