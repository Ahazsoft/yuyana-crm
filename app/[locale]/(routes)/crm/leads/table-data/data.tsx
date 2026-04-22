import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

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