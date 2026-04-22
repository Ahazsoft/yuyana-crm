import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CampaignModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const CampaignModal = ({
  title,
  description,
  isOpen,
  onClose,
  children,
}: CampaignModalProps) => {
  const onChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onChange}>
      <SheetContent side="right" className="w-full sm:max-w-[720px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
};