"use client";

import moment from "moment";
import Link from "next/link";

import { TeamConversations } from "../../tasks/viewtask/[taskId]/components/team-conversation";
import { useToast } from "@/components/ui/use-toast";

import { useRouter } from "next/navigation";
import { getTaskDone } from "../../actions/get-task-done";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CheckSquare, Eye, MessagesSquare, Pencil } from "lucide-react";
import UpdateTaskDialog from "../../dialogs/UpdateTask";
import { Button } from "@/components/ui/button";
import { Sections } from "@prisma/client";
import { ElementRef, useRef, useState } from "react";
import FormSheet from "@/components/sheets/form-sheet";

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

  const [updateOpenSheet, setUpdateOpenSheet] = useState(false);
  const closeRef = useRef<ElementRef<"button">>(null);

  const onDone = async (taskId: string) => {
    try {
      await getTaskDone(taskId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error, task not marked as done.",
      });
    } finally {
      toast({
        title: "Success, task marked as done.",
      });
      router.refresh();
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          gradient: "from-red-500 via-red-300 to-red-100",
          badge: "bg-red-100 text-red-700",
          text: "text-red-500",
        };
      case "normal":
        return {
          gradient: "from-yellow-500 via-yellow-300 to-yellow-100",
          badge: "bg-yellow-100 text-yellow-700",
          text: "text-yellow-500",
        };
      case "low":
        return {
          gradient: "from-green-500 via-green-300 to-green-100",
          badge: "bg-green-100 text-green-700",
          text: "text-green-500",
        };
      default:
        return {
          gradient: "from-slate-400 via-slate-200 to-muted",
          badge: "bg-slate-100 text-slate-700",
          text: "text-slate-600",
        };
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-center h-full w-full overflow-auto">
      {/* Tasks due today */}
      <div className="w-full md:w-1/2">
        <div>
          <h2 className="font-bold text-lg ">
            Tasks due Today ({dashboardData?.getTaskPastDue?.length})
          </h2>
        </div>

        <div className="space-y-2 mt-2">
          {dashboardData?.getTaskPastDue?.map((task: Tasks) => {
            const styles = getPriorityStyles(task.priority);
            const isOverdue = new Date(task.dueDateAt) < new Date();

            return (
              <div
                key={task.id}
                className="group rounded-2xl border w-[30vw] bg-background/60 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`h-2 w-full bg-gradient-to-r ${styles.gradient}`}
                />

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="flex-1 font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                      {task.title || "Untitled"}
                    </h3>
                    <span
                      className={`text-[11px] leading-5 whitespace-nowrap ml-2 ${
                        isOverdue
                          ? "text-red-600 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue ? "Overdue" : "Due"}{" "}
                      {moment(task.dueDateAt).format("MMM D, YYYY")}
                    </span>
                  </div>

                  {task.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {task.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                    {task.comments?.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {task.comments.length} comment
                        {task.comments.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Action buttons styled like TemplateCard */}
                  <div className="pt-1 grid grid-cols-4 gap-2 text-xs">
                    <Link
                      href={`/projects/tasks/viewtask/${task.id}`}
                      className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Link>

                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition">
                          <MessagesSquare className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </button>
                      </SheetTrigger>
                      <SheetContent className="max-w-3xl overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Team conversation</SheetTitle>
                          <SheetDescription>
                            Collaborate with your team on this task
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <TeamConversations
                            taskId={task.id}
                            data={task.comments}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>

                    <button
                      onClick={() => onDone(task.id)}
                      className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition"
                    >
                      <CheckSquare className="w-3.5 h-3.5 mr-1" />
                      Done
                    </button>

                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition">
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </button>
                      </SheetTrigger>
                      <SheetContent className="w-3xl overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Update task</SheetTitle>
                          <SheetDescription>
                            Edit task details including title, description, due
                            date, and priority
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <UpdateTaskDialog
                            boards={boards}
                            boardId={
                              sections.find(
                                (section) => section.id === task.section,
                              )?.board
                            }
                            initialData={task}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks due in 7 days */}
      <div className="w-full pt-5 md:w-1/2 md:pt-0">
        <div>
          <h2 className="font-bold text-lg ">
            Tasks due in 7 days (
            {dashboardData?.getTaskPastDueInSevenDays?.length})
          </h2>
        </div>

        <div className="space-y-2 mt-2">
          {dashboardData?.getTaskPastDueInSevenDays?.map((task: Tasks) => {
            const styles = getPriorityStyles(task.priority);
            const isOverdue = new Date(task.dueDateAt) < new Date();

            return (
              <div
                key={task.id}
                className="group rounded-2xl border w-[30vw] bg-background/60 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`h-2 w-full bg-gradient-to-r ${styles.gradient}`}
                />

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="flex-1 font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                      {task.title || "Untitled"}
                    </h3>
                    <span
                      className={`text-[11px] leading-5 whitespace-nowrap ml-2 ${
                        isOverdue
                          ? "text-red-600 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue ? "Overdue" : "Due"}{" "}
                      {moment(task.dueDateAt).format("MMM D, YYYY")}
                    </span>
                  </div>

                  {task.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {task.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                    {task.comments?.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {task.comments.length} comment
                        {task.comments.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Action buttons styled like TemplateCard */}
                  <div className="pt-1 grid grid-cols-4 gap-2 text-xs">
                    <Link
                      href={`/projects/tasks/viewtask/${task.id}`}
                      className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Link>

                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition">
                          <MessagesSquare className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </button>
                      </SheetTrigger>
                      <SheetContent className="max-w-3xl overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Team conversation</SheetTitle>
                          <SheetDescription>
                            Collaborate with your team on this task
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <TeamConversations
                            taskId={task.id}
                            data={task.comments}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>

                    <button
                      onClick={() => onDone(task.id)}
                      className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition"
                    >
                      <CheckSquare className="w-3.5 h-3.5 mr-1" />
                      Done
                    </button>

                    {/* Edit via a separate Sheet (not FormSheet) */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition">
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </button>
                      </SheetTrigger>
                      <SheetContent className="max-w-3xl overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Edit Task</SheetTitle>
                          <SheetDescription>
                            Update task details including title, description,
                            due date, and priority
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <UpdateTaskDialog
                            boards={boards}
                            initialData={task}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboardCockpit;
