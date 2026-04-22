"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { campaignSchema } from "../table-data/schema";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/modals/alert-modal";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MarketingCampaignEditForm } from "../components/MarketingCampaignEditForm";
// no extra icons needed here

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const campaign = campaignSchema.parse(row.original);

  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingData, setEditingData] = useState<any | null>(null);

  const { toast } = useToast();

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/marketing/campaigns/${campaign.id}`);
      toast({
        title: "Success",
        description: "Campaign has been deleted",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Something went wrong while deleting campaign. Please try again.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
      router.refresh();
    }
  };

  // handlers not required for campaigns: removed watch/unwatch

  

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Sheet open={updateOpen} onOpenChange={setUpdateOpen}>
        <SheetContent className="w-full md:max-w-[771px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Campaign - {editingData?.name || campaign?.name}</SheetTitle>
            <SheetDescription>Update campaign details</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <MarketingCampaignEditForm
              initialData={(editingData as any) || (row.original as any)}
              onCancel={() => setUpdateOpen(false)}
              onSuccess={() => {
                setUpdateOpen(false);
                router.refresh();
              }}
              templates={templates}
            />
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
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuItem onClick={() => router.push(`/marketing/campaigns/${campaign?.id}`)}>
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              setLoading(true);
              try {
                const [tplRes, campRes] = await Promise.all([
                  fetch(`/api/marketing/templates?take=200`),
                  fetch(`/api/marketing/campaigns/${campaign.id}`),
                ]);

                const tplJson = tplRes.ok ? await tplRes.json() : null;
                const campJson = campRes.ok ? await campRes.json() : null;

                setTemplates(tplJson?.templates || tplJson || []);
                setEditingData(campJson || row.original);
                setUpdateOpen(true);
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
