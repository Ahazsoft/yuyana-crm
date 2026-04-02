import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prismadb } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkResourceAccess } from "@/lib/auth-guard";
import { mapPrismaError } from "@/lib/crud-service";

export async function DELETE(req: Request, props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!params.projectId) {
    return new NextResponse("Missing project ID", { status: 400 });
  }
  
  const boardId = params.projectId;
  const userId = session.user.id;

  try {
    // Check if user has access to this project
    const hasAccess = await checkResourceAccess(userId, boardId, 'Boards');
    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Perform all operations in a single transaction
    await prismadb.$transaction(async (tx) => {
      // Get all sections for this board
      const sections = await tx.sections.findMany({
        where: {
          board: boardId,
        },
      });

      // Delete all tasks in each section
      for (const section of sections) {
        await tx.tasks.deleteMany({
          where: {
            section: section.id,
          },
        });
      }
      
      // Delete all sections
      await tx.sections.deleteMany({
        where: {
          board: boardId,
        },
      });

      // Finally delete the board itself
      await tx.boards.delete({
        where: {
          id: boardId,
        },
      });
    });

    return NextResponse.json({ message: "Board deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log("[PROJECT_DELETE]", error);
    
    const mappedError = mapPrismaError(error);
    return new NextResponse(mappedError.message || "Internal error", { status: 500 });
  }
}