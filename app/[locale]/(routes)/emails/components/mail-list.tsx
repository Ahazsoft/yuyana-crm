// @ts-nocheck
import { ComponentProps } from "react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMail } from "@/app/[locale]/(routes)/marketing/emails/use-mail";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type Mail = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  text?: string;
  date?: string;
  read?: boolean;
  labels?: string[];
  type?: string;
};

interface MailListProps {
  items: Mail[];
}

export function MailList({ items }: MailListProps) {
  const mail = useMail();

  return (
    <ScrollArea
      className="h-full overflow-y-auto"
      style={{ maxHeight: "55vh", minHeight: "55vh" }}
    >
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => {
          const cleanName = (item.name || item.email || "Unknown")
            .replace(/"/g, "")
            .replace(/<.*?>/, "")
            .trim();
          return (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                mail.selected === item.id && "bg-muted",
              )}
              onClick={() => {
                let tab = "inbox"; // Default to inbox

                // Check if it's a sent email
                if (item.type === "sent") {
                  tab = "sent";
                }
                // Check if it's an unread email
                else if (!item.read) {
                  tab = "unread";
                }
                // Check if it's in the all emails view
                else if (mail.selectedTab === "all") {
                  tab = "all";
                }

                mail.setSelected(item.id);
                mail.setSelectedTab(tab);
              }}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 w-[60%] min-w-0 overflow-hidden">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-semibold truncate cursor-default">
                          {cleanName}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{cleanName}</TooltipContent>
                    </Tooltip>

                    {!item.read && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      mail.selected === item.id
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{item.subject}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.text.substring(0, 300)}
              </div>
              {item.labels.length ? (
                <div className="flex items-center gap-2">
                  {item.labels.map((label) => (
                    <Badge
                      key={label}
                      variant={getBadgeVariantFromLabel(label)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}

