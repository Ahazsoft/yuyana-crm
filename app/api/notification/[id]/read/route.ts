import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthenticated", { status: 401 });
    }
    try {
        const notification = await prismadb.notifications.findUnique({
            where: { id },
        });

        if (!notification) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        if (notification.receiverId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        await prismadb.notifications.update({
            where: {
                id: id,
            },
            data: {
                isSeen: true,
            }
        })
        return NextResponse.json({ message: "Notification marked as read" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to mark notification as read" }, { status: 500 });
    }
}