"use client";

import { Row } from "@tanstack/react-table";
import { Ban, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { EmployeeSchema, Employee } from "../table-data/schema";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/modals/alert-modal";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const parsed = EmployeeSchema.safeParse(row.original as any);
  const employee = (
    parsed.success ? parsed.data : (row.original as any)
  ) as Employee & any;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "activate" | "deactivate" | "delete" | null
  >(null);

  const { toast } = useToast();

  const currentStatus =
    (employee as any).userStatus ?? (employee as any).status ?? "ACTIVE";

  const deactivateLabel =
    currentStatus === "ACTIVE" ? "Deactivate" : "Activate";

  const modalTitle =
    pendingAction === "delete"
      ? "Delete employee?"
      : pendingAction === "deactivate"
        ? "Deactivate employee?"
        : pendingAction === "activate"
          ? "Activate employee?"
          : "Are you sure?";

  const modalDescription =
    pendingAction === "delete"
      ? "This employee will be permanently removed from the system."
      : pendingAction === "deactivate"
        ? "The employee will no longer be able to sign in."
        : pendingAction === "activate"
          ? "The employee will be able to sign in again."
          : "This action cannot be undone.";

  const onConfirm = async () => {
    if (!employee?.id || !pendingAction) {
      return;
    }

    setLoading(true);

    try {
      if (pendingAction === "delete") {
        await axios.delete(`/api/user/${employee.id}`);
        toast({
          title: "Success",
          description: `${employee.name || employee.email} has been deleted.`,
        });
      } else if (pendingAction === "deactivate") {
        await axios.post(`/api/employee/deactivate/${employee.id}`);
        toast({
          title: "Success",
          description: "User has been deactivated.",
        });
      } else {
        await axios.post(`/api/employee/activate/${employee.id}`);
        toast({
          title: "Success",
          description: "User has been activated.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
      setPendingAction(null);
      router.refresh();
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title={modalTitle}
        description={modalDescription}
      />

      <TooltipProvider delayDuration={0}>
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push(`/employees/${employee.id}`)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setPendingAction(
                    currentStatus === "ACTIVE" ? "deactivate" : "activate",
                  );
                  setOpen(true);
                }}
              >
                <Ban className="h-4 w-4" />
                <span className="sr-only">{deactivateLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{deactivateLabel}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => {
                  setPendingAction("delete");
                  setOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}
