//@ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";

import { statuses } from "../table-data/data";
import { Campaign } from "../table-data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";
import Link from "next/link";

export const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <Link href={`/marketing/campaigns/${row.original?.id}`}>
        <div className="w-[250px]">{row.original.name}</div>
      </Link>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  // {
  //   accessorKey: "description",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Description" />
  //   ),
  //   cell: ({ row }) => <div className="w-[300px]">{row.getValue("description")}</div>,
  //   enableSorting: false,
  //   enableHiding: true,
  // },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find((s) => s.value === row.getValue("status"));
      if (!status) return null;
      return (
        <div className="flex w-[120px] items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "sentCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />,
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("sentCount") ?? 0}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "openCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Opens" />,
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("openCount") ?? 0}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "clickCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clicks" />,
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("clickCount") ?? 0}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "conversionCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Conversions" />,
    cell: ({ row }) => <div className="w-[100px]">{row.getValue("conversionCount") ?? 0}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "budget",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" />,
    cell: ({ row }) => {
      const b = row.getValue("budget");
      const num = typeof b === "string" ? parseFloat(b) : b;
      return <div>{num ? `$${num.toFixed(2)}` : "$0.00"}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "spent",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Spent" />,
    cell: ({ row }) => {
      const s = row.getValue("spent");
      const num = typeof s === "string" ? parseFloat(s) : s;
      return <div>{num ? `$${num.toFixed(2)}` : "$0.00"}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => <div>{moment(row.getValue("createdAt")).format("YY/MM/DD")}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
