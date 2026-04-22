"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { opportunitySchema } from "../table-data/schema";
import AlertModal from "@/components/modals/alert-modal";
import { useToast } from "@/components/ui/use-toast";
import { UpdateOpportunityForm } from "../components/UpdateOpportunityForm";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  // Use safeParse to prevent runtime crashes on bad data
  const validation = opportunitySchema.safeParse(row.original);
  
  if (!validation.success) {
    console.error("Invalid row data:", validation.error);
    return <div className="text-destructive text-xs">Data Error</div>;
  }

  const opportunity = validation.data;

  const onDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/crm/opportunity/${opportunity.id}`);
      toast({
        title: "Success",
        description: "Opportunity has been deleted",
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while deleting. Please try again.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

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
            <SheetTitle>Update Opportunity - {opportunity.name}</SheetTitle>
            <SheetDescription>Modify the details of this deal.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <UpdateOpportunityForm
              initialData={opportunity}
              setOpen={setUpdateOpen}
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
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => router.push(`/crm/opportunities/${opportunity.id}`)}
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// "use client";

// import { DotsHorizontalIcon } from "@radix-ui/react-icons";
// import { Row } from "@tanstack/react-table";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import { opportunitySchema } from "../table-data/schema";
// import { useRouter } from "next/navigation";
// import AlertModal from "@/components/modals/alert-modal";
// import { useState } from "react";
// import { useToast } from "@/components/ui/use-toast";
// import axios from "axios";
// import { UpdateOpportunityForm } from "../components/UpdateOpportunityForm";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";

// interface DataTableRowActionsProps<TData> {
//   row: Row<TData>;
// }

// export function DataTableRowActions<TData>({
//   row,
// }: DataTableRowActionsProps<TData>) {
//   const router = useRouter();
//   const opportunity = opportunitySchema.parse(row.original);

//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [updateOpen, setUpdateOpen] = useState(false);

//   const { toast } = useToast();

//   const onDelete = async () => {
//     setLoading(true);
//     try {
//       await axios.delete(`/api/crm/opportunity/${opportunity?.id}`);
//       toast({
//         title: "Success",
//         description: "Opportunity has been deleted",
//       });
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description:
//           "Something went wrong while deleting opportunity. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//       setOpen(false);
//       router.refresh();
//     }
//   };

//   return (
//     <>
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
//       />
//       <Sheet open={updateOpen} onOpenChange={setUpdateOpen}>
//         <SheetContent className="w-full md:max-w-[771px] overflow-y-auto">
//           <SheetHeader>
//             <SheetTitle>Update Opportunity - {opportunity?.name}</SheetTitle>
//             <SheetDescription>Update opportunity details</SheetDescription>
//           </SheetHeader>
//           <div className="mt-6 space-y-4">
//             <UpdateOpportunityForm
//               initialData={row.original}
//               setOpen={setUpdateOpen}
//             />
//           </div>
//         </SheetContent>
//       </Sheet>
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             variant="ghost"
//             className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
//           >
//             <DotsHorizontalIcon className="h-4 w-4" />
//             <span className="sr-only">Open menu</span>
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-[160px]">
//           <DropdownMenuItem
//             onClick={() => router.push(`/crm/opportunities/${opportunity?.id}`)}
//           >
//             View
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
//             Update
//           </DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem onClick={() => setOpen(true)}>
//             Delete
//             <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </>
//   );
// }
