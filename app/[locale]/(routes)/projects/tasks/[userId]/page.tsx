import { getTask } from "@/actions/projects/get-task";
import { getUserTasks } from "@/actions/projects/get-user-tasks";
import Container from "@/app/[locale]/(routes)/components/ui/Container";
import React from "react";
import { TasksDataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBoards } from "@/actions/projects/get-boards";

type TaskDetailPageProps = {
  params: Promise<{
    userId: string;
    username: string;
  }>;
};

const TaskDetailPage = async (props: TaskDetailPageProps) => {
  const params = await props.params;
  const session: Session | null = await getServerSession(authOptions);
  const { userId } = params;
  const boards: any = await getBoards(userId);
  const tasks: any = await getUserTasks(userId);
  if (!session) {
    redirect("/login");
  }
  const isAdmin = session.user.role === "ADMIN";
  return (
    <Container
      title={`${session.user.name}'s Tasks`}
      description={"Everything you need to know about tasks"}
    >
      <TasksDataTable
        data={tasks}
        columns={columns}
        isAdmin={isAdmin}
        boards={boards}
      />
    </Container>
  );
};

export default TaskDetailPage;
