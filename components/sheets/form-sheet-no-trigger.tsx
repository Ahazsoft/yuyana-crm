import React from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type RightSheetProps = {
  open?: boolean;
  setOpen: (open: boolean) => void;
  position?: "left" | "right" | "top" | "bottom";
  trigger?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  contentClassName?: string;
};

const FormSheetNoTrigger = ({
  open,
  setOpen,
  position,
  title,
  description,
  children,
  contentClassName,
}: RightSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side={position || "right"} className="max-w-3xl min-w-2xl flex-col justify-around overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 w-2xl">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FormSheetNoTrigger;
