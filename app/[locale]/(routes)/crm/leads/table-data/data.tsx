import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { ArchiveIcon, ArchiveRestore } from "lucide-react";

export const statuses = [
  {
    value: "NEW",
    label: "New",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "CONTACTED",
    label: "Contacted",
    icon: StopwatchIcon,
  },
  {
    value: "QUALIFIED",
    label: "Qualified",
    icon: CheckCircledIcon,
  },
  {
    value: "LOST",
    label: "Lost",
    icon: CrossCircledIcon,
  },
];

export const archiveddata = [
  { 
    value: "archived", 
    label: "Archived", 
    icon: ArchiveIcon 
  },
  { 
    value: "active", 
    label: "Active", 
    icon: ArchiveRestore 
  },
];
