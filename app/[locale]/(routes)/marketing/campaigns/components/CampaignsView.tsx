"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AccountDataTable } from "../table-components/data-table";
import { columns } from "../table-components/columns";
import { MarketingCampaignAddForm } from "./MarketingCampaignAddForm";

interface CampaignsViewProps {
  campaigns: any[];
  templates: any[];
}

export default function CampaignsView({ campaigns, templates }: CampaignsViewProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle>
              <Link href="/marketing/campaigns" className="hover:underline">
                Marketing Campaigns
              </Link>
            </CardTitle>
          </div>
          <div className="flex space-x-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" aria-label={"New"}>New</Button>
              </SheetTrigger>
              <SheetContent className="w-full md:max-w-[771px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Create Campaign</SheetTitle>
                  <SheetDescription>Create a new marketing campaign</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <MarketingCampaignAddForm
                    onCancel={() => setOpen(false)}
                    onSuccess={() => setOpen(false)}
                    templates={templates}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {!campaigns || (campaigns.length === 0 ? (
          "No campaigns"
        ) : (
          <AccountDataTable columns={columns} data={campaigns} industries={[]} />
        ))}
      </CardContent>
    </Card>
  );
}
