"use client";

import { useState } from "react";
import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CampaignModal } from "./components/CampaignModal";
import { MarketingCampaignForm } from "./components/MarketingCampaignForm";
import { getMarketingCampaigns } from "@/actions/marketing/get-marketing-campaigns";
import { MarketingCampaign } from "@/types/types";

type MarketingCampaignWithMetrics = {
  id: string;
  name: string;
  description: string;
  status: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
  budget?: number;
  spent?: number;
  createdAt: Date;
};

const MarketingCampaignsPage = () => {
  const t = useTranslations("ModuleMenu.marketing");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaignWithMetrics | null>(null);
  
  // For now using mock data, will connect to API later
  const campaigns: MarketingCampaignWithMetrics[] = [
    {
      id: "1",
      name: "Welcome Series",
      description: "Automated welcome emails",
      status: "Active",
      sentCount: 245,
      openCount: 78,
      clickCount: 12,
      conversionCount: 3,
      budget: 500,
      spent: 120,
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Product Launch",
      description: "Promote new product release",
      status: "Draft",
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      conversionCount: 0,
      budget: 2000,
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Seasonal Promotion",
      description: "Holiday discount campaign",
      status: "Paused",
      sentCount: 1204,
      openCount: 320,
      clickCount: 45,
      conversionCount: 12,
      budget: 1000,
      spent: 850,
      createdAt: new Date(),
    },
  ];

  const columns: ColumnDef<MarketingCampaignWithMetrics>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "sentCount",
      header: "Sent",
    },
    {
      accessorKey: "openCount",
      header: "Opens",
    },
    {
      accessorKey: "clickCount",
      header: "Clicks",
    },
    {
      accessorKey: "conversionCount",
      header: "Conversions",
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => `$${row.original.budget?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: "spent",
      header: "Spent",
      cell: ({ row }) => `$${row.original.spent?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign: MarketingCampaignWithMetrics) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    // In a real implementation, you would refresh the data here
  };

  return (
    <Container
      title={t("campaigns")}
      description="Create and manage your marketing campaigns"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Marketing Campaigns</h2>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
            onClick={handleCreateCampaign}
          >
            New Campaign
          </Button>
        </div>

        <div className="border rounded-lg">
          <DataTable
            columns={columns}
            data={campaigns}
            search="name"
          />
        </div>

        <CampaignModal
          title={editingCampaign ? "Edit Campaign" : "Create Campaign"}
          description={editingCampaign ? "Update your marketing campaign" : "Create a new marketing campaign"}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        >
          <MarketingCampaignForm
            initialData={editingCampaign || undefined}
            onCancel={handleCloseModal}
            onSuccess={handleSaveSuccess}
          />
        </CampaignModal>
      </div>
    </Container>
  );
};

export default MarketingCampaignsPage;