"use client";

import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { TeamConversations } from "../../tasks/viewtask/[taskId]/components/team-conversation";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getTaskDone } from "../../actions/get-task-done";
import { Task, taskSchema } from "../../data/schema";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  Clock3,
  Eye,
  MessageCircle,
  MessagesSquare,
  Pencil,
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
  taskStatus: string;
  comments: Comment[];
  user?: string;
  assigned_user?: {
    id: string;
    name: string;
  };
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
    accent: string;
    glow: string;
    label: string;
  }
> = {
  critical: {
    border: "border-red-500/30",
    badge:
      "bg-red-500/15 text-red-800 dark:text-red-300 border border-red-500/20",
    accent: "bg-red-500",
    glow: "hover:shadow-red-500/10",
    label: "Critical",
  },
  high: {
    border: "border-red-500/30",
    badge:
      "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20",
    accent: "bg-red-500",
    glow: "hover:shadow-red-500/10",
    label: "High",
  },
  medium: {
    border: "border-yellow-500/30",
    badge:
      "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20",
    accent: "bg-yellow-500",
    glow: "hover:shadow-yellow-500/10",
    label: "Medium",
  },
  low: {
    border: "border-emerald-500/30",
    badge:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
    accent: "bg-emerald-500",
    glow: "hover:shadow-emerald-500/10",
    label: "Low",
  },
};

const ProjectDashboardCockpit = ({
  dashboardData,
  // boards,
  // sections,
  isAdmin,
}: {
  dashboardData: DashboardData;
  // boards: any;
  // sections: Sections[];
  isAdmin: boolean;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState<string | null>(null);

  const onDone = async (taskId: string) => {
    setPendingTaskId(taskId);

    try {
      await getTaskDone(taskId);

      toast({
        title: "Success",
        description: "Task marked as done.",
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task could not be marked as done.",
      });
    } finally {
      setPendingTaskId(null);
    }
  };

  const getPriorityClasses = (priority: string) =>
    priorityMap[priority] || {
      border: "border-slate-500/20",
      badge:
        "bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-500/20",
      accent: "bg-slate-500",
      glow: "hover:shadow-slate-500/10",
      label: priority || "None",
    };

  const getDueMeta = (task: Tasks) => {
    const isOverdue = new Date(task.dueDateAt) < new Date();

    if (isOverdue) {
      return {
        tone: "text-red-600 dark:text-red-300",
        label: "Overdue",
      };
    }

    return {
      tone: "text-muted-foreground",
      label: moment(task.dueDateAt).fromNow(),
    };
  };

  const renderActionButton = ({
    href,
    icon: Icon,
    label,
    onClick,
    disabled = false,
  }: {
    href?: string;
    icon: typeof Eye;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => {
    const buttonClass = cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground",
      disabled && "pointer-events-none opacity-50",
    );

    if (href) {
      return (
        <Link
          href={href}
          title={label}
          aria-label={label}
          className={buttonClass}
        >
          <Icon className="h-4 w-4" />
        </Link>
      );
    }

    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={buttonClass}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  const renderTaskRow = (task: Tasks) => {
    const commentCount = task.comments?.length || 0;
    const isOverdue = new Date(task.dueDateAt) < new Date();
    const { border, badge, accent, label } = getPriorityClasses(task.priority);
    const dueMeta = getDueMeta(task);

    return (
      <div
        key={task.id}
        className={cn(
          "rounded-2xl border bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          border,
        )}
      >
        <div className="flex gap-3 border-l-[3px] border-transparent px-4 py-3">
          <span
            className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", accent)}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {task.title || "Untitled task"}
                  </p>

                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      badge,
                    )}
                  >
                    {label}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {moment(task.dueDateAt).format("MMM D, YYYY")}
                  </span>

                  {commentCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {commentCount} comment{commentCount === 1 ? "" : "s"}
                    </span>
                  )}

                  <span className={cn("font-medium", dueMeta.tone)}>
                    {dueMeta.label}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {renderActionButton({
                  href: `/projects/tasks/viewtask/${task.id}`,
                  icon: Eye,
                  label: "View task",
                })}

                <Sheet
                  open={editSheetOpen === task.id}
                  onOpenChange={(open) =>
                    setEditSheetOpen(open ? task.id : null)
                  }
                >
                  <SheetTrigger asChild>
                    {renderActionButton({
                      icon: Pencil,
                      label: "Edit task",
                    })}
                  </SheetTrigger>

                  <SheetContent className="max-w-3xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Edit Task</SheetTitle>
                      <SheetDescription>
                        Update task details and settings.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6">
                      {(() => {
                        const initialData = {
                          id: task.id,
                          title: task.title,
                          content: task.content, // ✅
                          taskStatus: task.taskStatus ?? null, // ✅ include status
                          dueDateAt: new Date(task.dueDateAt), // ✅ Date object
                          priority: task.priority,
                          user: task.user ?? task.assigned_user?.id ?? null,
                          assigned_user: task.assigned_user?.id
                            ? {
                                id: task.assigned_user.id,
                                name: task.assigned_user.name,
                              }
                            : null, // ✅ null when unassigned
                        };

                        return (
                          <UpdateTaskDialog
                            initialData={initialData}
                            onDone={() => setEditSheetOpen(null)}
                          />
                        );
                      })()}
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    {renderActionButton({
                      icon: MessagesSquare,
                      label: "Open chat",
                    })}
                  </SheetTrigger>

                  <SheetContent className="max-w-3xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Team Conversation</SheetTitle>
                      <SheetDescription>
                        Collaborate with your team members.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6">
                      <TeamConversations
                        taskId={task.id}
                        data={task.comments}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {renderActionButton({
                  icon: CheckSquare,
                  label: "Mark as done",
                  onClick: () => onDone(task.id),
                  disabled: pendingTaskId === task.id,
                })}
              </div>
            </div>

            <p
              className="my-3 line-clamp-2 text-sm leading-6 text-muted-foreground"
              title={task.content || "No task description provided."}
            >
              {task.content || "No task description provided."}
            </p>

            {/* <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              {isOverdue ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-red-600 dark:text-red-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Overdue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  Due soon
                </span>
              )}
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  const taskSections = [
    {
      title: "Tasks Due Today",
      subtitle: "Tasks that require immediate attention.",
      items: dashboardData?.getTaskPastDue || [],
      emptyMessage: "No tasks due today.",
    },
    {
      title: "Tasks Due in 7 Days",
      subtitle: "Upcoming tasks scheduled this week.",
      items: dashboardData?.getTaskPastDueInSevenDays || [],
      emptyMessage: "No upcoming tasks found.",
    },
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {taskSections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-border/50 bg-background/50 p-5 shadow-sm backdrop-blur-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.subtitle}
                </p>
              </div>

              <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                {section.items.length}
              </div>
            </div>

            {section.items.length > 0 ? (
              <div className="space-y-3">
                {section.items.map((task) => renderTaskRow(task))}
              </div>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
                {section.emptyMessage}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default ProjectDashboardCockpit;
