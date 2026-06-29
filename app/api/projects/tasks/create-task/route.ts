import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import NewTaskFromCRMEmail from "@/emails/NewTaskFromCRM";
import NewTaskFromProject from "@/emails/NewTaskFromProject";
import resendHelper from "@/lib/resend";

//Create new task in project route
/*
TODO: there is second route for creating task in board, but it is the same as this one. Consider merging them (/api/projects/tasks/create-task/[boardId]). 
*/
export async function POST(req: Request) {
  /*
  Resend.com function init - this is a helper function that will be used to send emails
  */
  // let resend;
  // try {
  //   resend = await resendHelper();
  // } catch (error: any) {
  //   return NextResponse.json(
  //     { error: error?.message || "Resend API key is not configured" },
  //     { status: 500 }
  //   );
  // }
  
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const {
    title,
    user,
    // board,
    priority,
    content,
    // account,
    dueDateAt,
  } = body;

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!title || !user || !priority || !content) {
    return new NextResponse("Missing one of the task data ", { status: 400 });
  }

  try {
    // Get first section from board where position is smallest
    // const sectionId = await prismadb.sections.findFirst({
    //   where: {
    //     board: board,
    //   },
    //   orderBy: {
    //     position: "asc",
    //   },
    // });

    // if (!sectionId) {
    //   return new NextResponse("No section found", { status: 400 });
    // }

    // const tasksCount = await prismadb.tasks.count({
    //   where: {
    //     section: sectionId.id,
    //   },
    // });

    const task = await prismadb.tasks.create({
      data: {
        v: 0,
        priority: priority,
        title: title,
        content: content,
        dueDateAt: dueDateAt,
        // section: sectionId.id,
        createdBy: session.user.id,
        updatedBy: session.user.id,
        // position: tasksCount > 0 ? tasksCount : 0,
        user: user,
        taskStatus: "ACTIVE",
      },
    });

    // Make update to Board - updatedAt field to trigger re-render and reorder
    // await prismadb.boards.update({
    //   where: {
    //     id: board,
    //   },
    //   data: {
    //     updatedAt: new Date(),
    //   },
    // });

    await prismadb.notifications.create({
      data: {
        title: `New Task : ${title}`,
        description: `You have been assigned to a new task : \n${content}.`,
        receiverId: user,
        link: `/projects/tasks/viewtask/${task.id}`,
        category: "Projects",
        subCategory: "Tasks",      
      }
    });



    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("[NEW_BOARD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}
