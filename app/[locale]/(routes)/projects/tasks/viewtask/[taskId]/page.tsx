import { getTask } from "@/actions/projects/get-task";
import React from "react";
import moment from "moment";

import { getDocuments } from "@/actions/documents/get-documents";
import { getTaskComments } from "@/actions/projects/get-task-comments";
import { getTaskDocuments } from "@/actions/projects/get-task-documents";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { TeamConversations } from "./components/team-conversation";
import { TaskDataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { columnsTask } from "./components/columns-task";

import TaskViewActions from "./components/TaskViewActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Shield,
  User,
  Flag,
  CheckCircle2,
  Clock,
  ArrowLeft,
  FlagIcon,
} from "lucide-react";
import { prismadb } from "@/lib/prisma";
import { getBoards } from "@/actions/projects/get-boards";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

type TaskPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

const TaskPage = async (props: TaskPageProps) => {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const { taskId } = params;
  const task: any = await getTask(taskId);
  const [taskDocuments, documents, comments, boards] = await Promise.all([
    getTaskDocuments(taskId),
    getDocuments(),
    getTaskComments(taskId),
    getBoards(user?.id!),
  ]);
  const creatorUser = task?.createdBy
    ? await prismadb.users.findFirst({
        where: { id: task.createdBy },
        select: { name: true },
      })
    : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/projects/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ----- LEFT COLUMN : Task Details ----- */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden border shadow-sm">
            {/* Colored header strip based on priority */}
            <div
              className={`h-2 ${
                task.priority === "critical"
                  ? "bg-red-800"
                  : task.priority === "high"
                    ? "bg-destructive"
                    : task.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-muted-foreground/30"
              }`}
            />

            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    {task.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed max-w-2xl">
                    {task.content ? (
                      task.content
                    ) : (
                      <span className="italic text-muted-foreground/70">
                        No description found.
                      </span>
                    )}
                  </CardDescription>
                </div>
                {/* Only status badge here, priority removed */}
                <StatusBadge status={task.taskStatus} />
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-6 space-y-4">
              {/* Row 1: Created by & Assigned to */}
              <div className="grid grid-cols-2 gap-4">
                <MetaItem
                  icon={<User />}
                  label="Created by"
                  value={creatorUser?.name || "Unknown"}
                />
                <MetaItem
                  icon={<User />}
                  label="Assigned to"
                  value={task.assigned_user?.name || "Unassigned"}
                />
              </div>

              {/* Row 2: Created & Last modified */}
              <div className="grid grid-cols-2 gap-4">
                <MetaItem
                  icon={<Calendar />}
                  label="Created"
                  value={moment(task.createdAt).format(
                    "MMM D, YYYY [at] HH:mm",
                  )}
                />
                <MetaItem
                  icon={<Clock />}
                  label="Last modified"
                  value={moment(task.lastEditedAt).format(
                    "MMM D, YYYY [at] HH:mm",
                  )}
                />
              </div>

              {/* Row 3: Due date & Priority (as a field) */}
              <div className="grid grid-cols-2 gap-4">
                <MetaItem
                  icon={<Clock />}
                  label="Due date"
                  value={
                    task.dueDateAt
                      ? moment(task.dueDateAt).format("MMM D, YYYY [at] HH:mm")
                      : "No due date"
                  }
                />
                <MetaItem
                  icon={<FlagIcon />}
                  label="Priority"
                  value={task.priority}
                />
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-6 flex flex-wrap gap-3">
              <TaskViewActions
                taskId={taskId}
                boards={boards}
                initialData={task}
              />
            </CardFooter>
          </Card>

          {/* Optional document tables (commented) */}
          {/* 
          <Separator className="my-8" />
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight py-5">
            Task documents ({taskDocuments.length})
          </h4>
          <TaskDataTable data={taskDocuments} columns={columnsTask} />
          <Separator className="my-8" />
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight py-5">
            Available documents ({documents.length})
          </h4>
          <TaskDataTable data={documents} columns={columns} />
          */}
        </div>

        {/* ----- RIGHT COLUMN : Conversations ----- */}
        <div className="w-full lg:w-[380px] shrink-0">
          <TeamConversations data={comments as any} taskId={task.id} />
        </div>
      </div>
    </div>
  );
};

export default TaskPage;

/* ========== Helper Components ========== */

const PriorityBadge = ({ priority }: { priority: string }) => {
  const config: Record<
    string,
    {
      variant: "destructive" | "secondary" | "outline" | "default";
      icon: typeof Flag;
      label: string;
      className?: string;
    }
  > = {
    low: { variant: "outline", icon: Flag, label: "Low" },
    medium: {
      variant: "secondary",
      icon: Flag,
      label: "Medium",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    high: { variant: "destructive", icon: Flag, label: "High" },
    critical: {
      variant: "destructive",
      icon: Flag,
      label: "Critical",
      className: "bg-red-800 text-white hover:bg-red-900 dark:bg-red-900/60",
    },
  };

  const {
    variant,
    icon: Icon,
    label,
    className = "",
  } = config[priority] || config.low;

  return (
    <Badge variant={variant} className={`gap-1 ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isComplete = status === "COMPLETE";
  return (
    <Badge
      variant={isComplete ? "default" : "outline"}
      className={`gap-1 ${
        isComplete
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          : ""
      }`}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {isComplete ? "Completed" : "Active"}
    </Badge>
  );
};

const MetaItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex gap-3 items-start p-2 rounded-lg transition-colors hover:bg-accent/50">
    <div className="mt-0.5 text-muted-foreground">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);

