"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ContactsDataTable } from "@/app/[locale]/(routes)/crm/contacts/table-components/data-table";
import { createColumns } from "../table-components/columns";
import { Employee } from "../table-data/schema";

interface Props {
  data: Employee[];
}

export default function EmployeesTable({ data }: Props) {
  const columns = React.useMemo(() => createColumns(), []);

  return <ContactsDataTable columns={columns as ColumnDef<any, any>[]} data={data} />;
}
