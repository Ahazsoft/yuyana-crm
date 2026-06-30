//@ts-nocheck
import React from "react";
import Container from "../../components/ui/Container2";
import { getTasks } from "@/actions/projects/get-tasks";
import { TasksDataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { getUserTasks } from "@/actions/projects/get-user-tasks";
import { redirect } from "next/navigation";
import NewTaskDialog from "../dialogs/NewTask";
import { getBoards } from "@/actions/projects/get-boards";

const TasksPage = async () => {
  const t = await getTranslations("ProjectsPage");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const tasks: any = await getTasks();
  const mytasks = await getUserTasks(session.user.id);
  const boards: any = await getBoards(session.user.id);
  const isAdmin = session.user.role === "ADMIN";

  // console.log({ tasks, mytasks });
  if (isAdmin) {
    return (
      <>
        <div className="pb-5">
          <Container
            title={`${session?.user.name}'s Tasks`}
            description={"Everything you need to know about tasks"}
          >
            <TasksDataTable data={mytasks} columns={columns} isAdmin={isAdmin}
          /* boards={boards} *//>
          </Container>
        </div>
        <Container
          title="All Tasks"
          description={t("tasks.description")}
          buttonComponent={<NewTaskDialog /* boards={boards} */ />}
        >
          {/* <div className="py-5">
            <Button>{t("tasks.newTask")}</Button>
          </div> */}
          <div>
            <TasksDataTable data={tasks} columns={columns} isAdmin={isAdmin}
          /* boards={boards} *//>
          </div>
        </Container>
      </>
    );
  }

  return (
    <Container
      title={`${session?.user.name}'s Tasks`}
      description={"Everything you need to know about tasks"}
    >
      <TasksDataTable data={mytasks} columns={columns} isAdmin={isAdmin}
          boards={boards}/>
    </Container>
  );
};

export default TasksPage;
