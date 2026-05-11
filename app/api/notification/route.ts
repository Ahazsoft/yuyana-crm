import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthenticated", { status: 401 });
    }

    const notifications = await prismadb.notifications.findMany({
        where: {
            receiverId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        }
    })

    return NextResponse.json({ notifications }, { status: 200 });
}