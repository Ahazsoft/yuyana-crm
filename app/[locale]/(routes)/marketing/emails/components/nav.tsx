"use client";

import Link from "next/link";
import React, { ElementType } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: ElementType<any>;
    variant: "default" | "ghost";
  }[];
  filterLinks?: boolean; // Whether to filter links to only show inbox/sent
}

export function Nav({ links, isCollapsed, filterLinks = true }: NavProps) {
  // Filter links based on the filterLinks flag
  const processedLinks = filterLinks 
    ? links.filter(
        (link) =>
          link.title.toLowerCase() === "inbox" ||
          link.title.toLowerCase() === "sent"
      )
    : links; // Don't filter if filterLinks is false

  return (
    <div
      data-collapsed={isCollapsed}
      className="group border-collapse flex w-full items-start data-[collapsed=true]:justify-center"
    >
      <nav className="grid gap-1 group-[[data-collapsed=true]]:justify-center">
        {processedLinks.map((link, index) =>
          isCollapsed ? (
            <Button
              key={index}
              variant={link.variant}
              size="icon"
              className="h-9 w-9 rounded-md p-0"
              title={link.title}
            >
              {React.isValidElement(link.icon) ? link.icon : React.createElement(link.icon)}
            </Button>
          ) : (
            <Button
              key={index}
              variant={link.variant === "default" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-9 w-full justify-start text-sm font-normal mb-1",
                link.variant === "default" &&
                  "dark:bg-muted dark:hover:bg-muted dark:hover:text-white"
              )}
            >
              <span className="mr-2 h-4 w-4">{React.isValidElement(link.icon) ? link.icon : React.createElement(link.icon)}</span>
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                      "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </Button>
          )
        )}
      </nav>
    </div>
  );
}