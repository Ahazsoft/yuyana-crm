"use client";

import { columns } from "@/app/[locale]/(routes)/documents/components/columns";
import { DocumentsDataTable } from "@/app/[locale]/(routes)/documents/components/data-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface DocumentsViewProps {
  data: any;
}

const DocumentsView = ({ data }: DocumentsViewProps) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle onClick={() => router.push("/documents")} className="cursor-pointer">
              Documents
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {data?.length ?? 0} assigned documents
            </CardDescription>
          </div>
          <div className="flex space-x-2"></div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No assigned documents found</div>
        ) : (
          <DocumentsDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsView;
