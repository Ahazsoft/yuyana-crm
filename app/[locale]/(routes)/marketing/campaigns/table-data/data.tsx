import {
  CheckIcon,
  PauseIcon,
  Pencil1Icon,
  LockClosedIcon
} from "@radix-ui/react-icons";

export const statuses = [
  { value: "ACTIVE", label: "Active", icon: CheckIcon },
  { value: "PAUSED", label: "Paused", icon: PauseIcon },
  { value: "DRAFT", label: "Draft", icon: Pencil1Icon },
  { value: "INACTIVE", label: "Inactive", icon: LockClosedIcon },
];
