import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: any) {
    try {
        const { segmentId } = await params;
        // delete members first due to FK constraints
        await prismadb.$transaction([
            prismadb.marketingSegmentMember.deleteMany({ where: { segmentId } }),
            prismadb.marketingSegment.delete({ where: { id: segmentId } }),
        ]);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        console.log("[SEGMENT_DELETE_ERR]", e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
