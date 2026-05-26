"use client";

import moment from "moment";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TeamConversations } from "../../tasks/viewtask/[taskId]/components/team-conversation";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getTaskDone } from "../../actions/get-task-done";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CheckSquare,
  Clock3,
  Eye,
  MessagesSquare,
  Pencil,
  AlertTriangle,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import UpdateTaskDialog from "../../dialogs/UpdateTask";
import { Sections } from "@prisma/client";

interface DashboardData {
  getTaskPastDue: Tasks[];
  getTaskPastDueInSevenDays: Tasks[];
}

export interface Tasks {
  id: string;
  title: string;
  content: string;
  dueDateAt: Date;
  priority: string;
  section: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const priorityMap: Record<
  string,
  {
    border: string;
    badge: string;
    glow: string;
    label: string;
  }
> = {
  critical: {
    border: "border-red-500/30",
    badge:
      "bg-red-500/15 text-red-800 dark:text-red-400 border border-red-500/20",
    glow: "hover:shadow-red-500/10",
    label: "Critical",
  },
  high: {
    border: "border-red-500/30",
    badge:
      "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20",
    glow: "hover:shadow-red-500/10",
    label: "High",
  },
  medium: {
    border: "border-yellow-500/30",
    badge:
      "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20",
    glow: "hover:shadow-yellow-500/10",
    label: "Medium",
  },
  low: {
    border: "border-emerald-500/30",
    badge:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    glow: "hover:shadow-emerald-500/10",
    label: "Low",
  },
};

const ProjectDashboardCockpit = ({
  dashboardData,
  boards,
  sections,
  isAdmin,
}: {
  dashboardData: DashboardData;
  boards: any;
  sections: Sections[];
  isAdmin: boolean;
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const onDone = async (taskId: string) => {
    try {
      await getTaskDone(taskId);

      toast({
        title: "Success, task marked as done.",
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error, task not marked as done.",
      });
    }
  };

  const getPriorityClasses = (priority: string) =>
    priorityMap[priority] || {
      border: "border-slate-500/20",
      badge:
        "bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20",
      glow: "hover:shadow-slate-500/10",
      label: priority || "None",
    };

  const renderTaskCard = (
    task: Tasks,
    type: "today" | "upcoming" = "today",
  ) => {
    const isOverdue = new Date(task.dueDateAt) < new Date();

    const { border, badge, glow, label } = getPriorityClasses(task.priority);

    return (
      <div
        key={task.id}
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-sm",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
          "p-5 flex flex-col justify-between min-h-[250px] w-[17vw]",
          border,
          glow,
        )}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br  from-background via-background to-muted/20 opacity-80 pointer-events-none" />

        {/* Top */}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold leading-6 line-clamp-2 text-foreground">
                {task.title || "Untitled"}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    badge,
                  )}
                >
                  {label}
                </span>

                {task.comments?.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    {task.comments.length}
                  </span>
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-semibold",
                isOverdue
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isOverdue ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}

              {moment(task.dueDateAt).format("MMM D")}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <p className="text-sm leading-6 text-muted-foreground line-clamp-4">
              {task.content || "No task description provided."}
            </p>
          </div>

          {/* Date */}
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {isOverdue ? "Overdue since" : "Due on"}{" "}
              {moment(task.dueDateAt).format("MMMM D, YYYY")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-2">
          {/* View */}
          <Link
            href={`/projects/tasks/viewtask/${task.id}`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 px-3 text-xs font-medium transition-all hover:bg-accent"
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>

          {/* Done */}
          {/* <button
            onClick={() => onDone(task.id)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 px-3 text-xs font-medium transition-all hover:bg-accent"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Done
          </button> */}

          {/* Chat */}
          
            {/* <Sheet>
              <SheetTrigger asChild>
                <button className="inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 px-3 text-xs font-medium transition-all hover:bg-accent">
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  Chat
                </button>
              </SheetTrigger>

              <SheetContent className="max-w-3xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Team Conversation</SheetTitle>
                  <SheetDescription>
                    Collaborate with your team members.
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                  <TeamConversations taskId={task.id} data={task.comments} />
                </div>
              </SheetContent>
            </Sheet> */}
         

          {/* Edit */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 px-3 text-xs font-medium transition-all hover:bg-accent"                  ,
                )}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </button>
            </SheetTrigger>

            <SheetContent className="max-w-3xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Edit Task</SheetTitle>
                <SheetDescription>
                  Update task details and settings.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <UpdateTaskDialog
                  boards={boards}
                  boardId={sections.find((s) => s.id === task.section)?.board}
                  initialData={task}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Today Tasks */}
        <section className="rounded-3xl border border-border/50 bg-background/50 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Tasks Due Today
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Tasks that require immediate attention.
              </p>
            </div>

            <div className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl bg-primary/10 px-4 text-sm font-bold text-primary">
              {dashboardData?.getTaskPastDue?.length || 0}
            </div>
          </div>

          {dashboardData?.getTaskPastDue?.length > 0 ? (
           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {dashboardData?.getTaskPastDue?.map((task) =>
                renderTaskCard(task, "today"),
              )}
            </div>
          ) : (
            <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
              No tasks due today.
            </div>
          )}
        </section>

        {/* Upcoming Tasks */}
        <section className="rounded-3xl border border-border/50 bg-background/50 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Tasks Due in 7 Days
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Upcoming tasks scheduled this week.
              </p>
            </div>

            <div className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl bg-primary/10 px-4 text-sm font-bold text-primary">
              {dashboardData?.getTaskPastDueInSevenDays?.length || 0}
            </div>
          </div>

          {dashboardData?.getTaskPastDueInSevenDays?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {dashboardData?.getTaskPastDueInSevenDays?.map((task) =>
                renderTaskCard(task, "upcoming"),
              )}
            </div>
          ) : (
            <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
              No upcoming tasks found.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProjectDashboardCockpit;
