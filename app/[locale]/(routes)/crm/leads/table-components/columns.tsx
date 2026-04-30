"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { statuses } from "../table-data/data";
import { Lead } from "../table-data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import moment from "moment";

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),

    cell: ({ row }) => (
      <div className="w-[150px]">
        {row.original.firstName
          ? row.getValue("firstName")
          : "" + " " + row.original.lastName}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "assigned_to_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned Sales Person" />
    ),

    cell: ({ row }) => (
      <div className="w-[150px]">
        {
          //@ts-ignore
          //TODO: fix this
          row.getValue("assigned_to_user")?.name ?? "Unassigned"
        }
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
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
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),

    cell: ({ row }) => <div className="w-[150px]">{row.getValue("phone")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  //  {
  //   accessorKey: "email",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="E-mail" />
  //   ),

  //   cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue("email")}</div>,
  //   enableSorting: true,
  //   enableHiding: true,
  //   // size:200
  // },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),

    cell: ({ row }) => (
      <div className="w-[200px]">
        {
          row.getValue("description")
        }
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
   {
    accessorKey: "followup_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Follow up Date" />
    ),

    cell: ({ row }) => (
      <div className="w-[80px]">
         {row.getValue("followup_date") ?         
         moment(row.getValue("followup_date")).format("DD-MM-YY") : "" }
       </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  // {
  //   accessorKey: "isArchived",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Archived" />
  //   ),
  //   cell: ({ row }) => (
  //     <Badge
  //       variant={
  //         row.getValue("isArchived") === "archived" ? "secondary" : "outline"
  //       }
  //     >
  //       {row.getValue("isArchived") === "active" ? "Active" : "Archive"}
  //     </Badge>
  //   ),
  //   filterFn: (row, id, value) => {
  //     console.log("isArchived row value:", row.getValue(id));
  //     console.log("isArchived filter value:", value);
  //     return value.includes(row.getValue(id));
  //   },
  //   enableSorting: false,
  //   enableHiding: true,
  // },
  // {
  //   accessorKey: "createdAt",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Expected close" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="w-[80px]">
  //       {moment(row.getValue("createdAt")).format("YY-MM-DD")}
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  // {
  //   accessorKey: "updatedAt",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Last update" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="w-[80px]">
  //       {moment(row.getValue("updatedAt")).format("YY-MM-DD")}
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
