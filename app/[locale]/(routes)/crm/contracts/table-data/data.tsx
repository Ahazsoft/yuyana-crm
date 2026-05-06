import {
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { BriefcaseBusiness, PenLineIcon, Rotate3D, User } from "lucide-react";

export const statuses = [
  {
    value: "NOTSTARTED",
    label: "Not started",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "INPROGRESS",
    label: "In progress",
    icon: Rotate3D,
  },
  {
    value: "SIGNED",
    label: "Signed",
    icon: PenLineIcon,
  },
];

export const contractType = [
  {
    value: "customer",
    label: "Customer",
    icon: User,
  },
  {
    value: "company",
    label: "Company",
    icon: BriefcaseBusiness,
  }
];
