"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { contractType, statuses } from "../table-data/data";
import { Lead } from "../table-data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),

    cell: ({ row }) => <div className="w-[150px]">{row.getValue("title")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customers" />
    ),
    cell: ({ row }) => (
      <div>
        {row.original.type === "company"
          ? (row.original.assigned_account?.name ?? "Not assigned")
          : (row.original.assigned_contact
              ? [row.original.assigned_contact.first_name, row.original.assigned_contact.last_name].filter(Boolean).join(" ")
              : "Not assigned")}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "signedDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Signed Date" />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      let dateValue = null;
      if (type === "company") {
        dateValue = row.original.companySignedDate || row.getValue("companySignedDate");
      } else if (type === "customer") {
        dateValue = row.original.customerSignedDate || row.getValue("customerSignedDate");
      }
      return (
        <div>
          {dateValue ? moment(dateValue).format("YY-MM-DD") : "Not signed yet"}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "assigned_to_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned to" />
    ),

    cell: ({ row }) => (
      <div className="w-[150px]">
        {row.original.assigned_to_user
          ? row.original.assigned_to_user.name
          : "Unassigned"}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="type" />
    ),
    cell: ({ row }) => {
      const contracttype = contractType.find(
        (contracttype) => contracttype.value === row.getValue("type"),
      );
      if (!contracttype) {
        return null;
      }
      return (
        <div className="flex w-[100px] items-center">
          {contracttype.icon && (
            <contracttype.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{contracttype.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status"),
      );
      if (!status) {
        return null;
      }
      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue("createdAt")).format("YY-MM-DD")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last update" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">
        {moment(row.getValue("updatedAt")).format("YY-MM-DD")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
