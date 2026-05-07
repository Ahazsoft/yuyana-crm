"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  // Use safeParse to avoid throwing if data doesn't fully conform to schema
  const parsed = EmployeeSchema.safeParse(row.original as any);
  const employee = (parsed.success ? parsed.data : (row.original as any)) as Employee & any;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<"activate" | "deactivate" | null>(null);

  const { toast } = useToast();

  const onConfirm = async () => {
    if (!employee?.id || !pendingAction) return;
    setLoading(true);
    try {
      if (pendingAction === "deactivate") {
        await axios.delete(`/api/users/deactivate/${employee.id}`);
        toast({ title: "Success", description: "User deactivated." });
      } else {
        await axios.post(`/api/users/activate/${employee.id}`);
        toast({ title: "Success", description: "User activated." });
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

  const currentStatus = (employee as any).userStatus ?? (employee as any).status ?? "ACTIVE";

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onConfirm} loading={loading} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
