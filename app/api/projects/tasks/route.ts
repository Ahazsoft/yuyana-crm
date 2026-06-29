import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

//Update task API endpoint
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  // console.log(body, "body");
  const { id, section } = body;

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!id) {
    return new NextResponse("Missing board id", { status: 400 });
  }


  try {
    await prismadb.tasks.update({
      where: {
        id: id,
      },
      data: {
        updatedBy: session.user.id,
        section: section,
      },
    });
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("[NEW_BOARD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

//Delete task API endpoint
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  console.log(body, "body");
  const { id, section } = body;

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!id) {
    return new NextResponse("Missing board id", { status: 400 });
  }

  try {

    const currentTask = await prismadb.tasks.findUnique({
      where: { id },
    });

    if (!currentTask) {
      return new NextResponse("Task not found", { status: 404 });
    }

    await prismadb.tasks.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("[NEW_BOARD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}
