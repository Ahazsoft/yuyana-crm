"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            onClick={() => router.push(`/employees/${employee.id}`)}
          >
            View Activity
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {currentStatus === "ACTIVE" ? (
            <DropdownMenuItem
              onClick={() => {
                setPendingAction("deactivate");
                setOpen(true);
              }}
            >
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                setPendingAction("activate");
                setOpen(true);
              }}
            >
              Activate
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              setPendingAction("delete");
              setOpen(true);
            }}
          >
            Delete Employee
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
