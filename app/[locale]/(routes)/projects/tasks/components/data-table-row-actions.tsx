"use client";

import axios from "axios";
import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Pencil, Trash, Eye } from "lucide-react"; // Added Pencil icon

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AlertModal from "@/components/modals/alert-modal";
import { taskSchema } from "../data/schema";

// Import your Task Dialog
import UpdateTaskDialog from "@/app/[locale]/(routes)/projects/dialogs/UpdateTask";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  isAdmin: boolean;
  boards: any;
}

export function DataTableRowActions<TData>({
  row,isAdmin,boards
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const task = taskSchema.parse(row.original);

  const { toast } = useToast();

  const [open, setOpen] = useState(false); // Delete modal state
  const [editOpen, setEditOpen] = useState(false); // Edit sheet state
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/projects/tasks/`, {
        data: {
          id: task?.id,
          section: task?.section,
        },
      });
      toast({
        title: "Task deleted",
        description: "Task deleted successfully",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while deleting the task",
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />

      {/* Edit Task Sheet (Popup) */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Task</SheetTitle>
            <SheetDescription>
              Update task details, due date, priority, and status.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <UpdateTaskDialog
              initialData={task}
              // Note: If UpdateTaskDialog requires 'boards' prop, 
              // you may need to pass it here or fetch it inside the dialog
              onDone={() => {
                setEditOpen(false);
                router.refresh();
              } } boards={undefined}            />
          </div>
        </SheetContent>
      </Sheet>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            onClick={() => router.push(`/projects/tasks/viewtask/${task?.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>

          {/* Conditional ADMIN Edit Action */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}