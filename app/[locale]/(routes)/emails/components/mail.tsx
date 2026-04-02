"use client";
import * as React from "react";
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  Mail,
  MessagesSquare,
  PenBox,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react";

import { AccountSwitcher } from "@/app/[locale]/(routes)/emails/components/account-switcher";
import { MailDisplay } from "@/app/[locale]/(routes)/emails/components/mail-display";
import { MailList } from "@/app/[locale]/(routes)/emails/components/mail-list";
import { Nav } from "@/app/[locale]/(routes)/emails/components/nav";
import { Mail as MailType, inboxMails, sentMails } from "@/app/[locale]/(routes)/emails/data";
import { useMail } from "@/app/[locale]/(routes)/emails/use-mail";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  mails: MailType[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function MailComponent({
  accounts,
  mails,
  defaultLayout = [20, 35, 45],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const mail = useMail();

  // Calculate counts
  const unreadMailsCount = mails.filter(mail => !mail.read).length;
  const inboxMailsCount = inboxMails.length;
  const sentMailsCount = sentMails.length;

  // Separate compose link from inbox/sent links
  const composeLink = {
    title: "Compose",
    label: "",
    icon: <PenBox />,
    variant: "ghost",
  };
  
  const mainLinks = [
    {
      title: "Inbox",
      label: `${inboxMailsCount}`, // Show inbox count
      icon: <Inbox />,
      variant: "default",
    },
    {
      title: "Sent",
      label: `${sentMailsCount}`, // Show sent count
      icon: <Send />,
      variant: "ghost",
    },
    {
      title: "Unread",
      label: `${unreadMailsCount}`, // Show unread count
      icon: <Mail />, // Using Mail icon for Unread
      variant: "ghost",
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChange={(layout) => {
          // Convert v4 layout object to array format for storage
          const layoutArray = Object.values(layout);
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            layoutArray
          )}`;
        }}
        className="h-full flex-row"
      >
        <ResizablePanel
          defaultSize={`${defaultLayout[0]}%`}
          collapsedSize={`${navCollapsedSize}%`}
          collapsible={true}
          minSize="18%"
          maxSize="20%"
          onResize={(panelSize) => {
            const collapsed = panelSize.asPercentage <= navCollapsedSize;
            if (collapsed !== isCollapsed) {
              setIsCollapsed(collapsed);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                collapsed
              )}`;
            }
          }}
          className={cn(
            isCollapsed && "transition-all duration-300 ease-in-out"
          )}
        >
          <div className="flex items-center p-2">
            <div
              className="w-full"
              // className={cn("w-full flex-1", isCollapsed ? "w-full" : "w-[80%]")}
            >
              <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
            </div>
          </div>
          <Separator />
          <div className={cn(isCollapsed ? "block" : "hidden")}>
            <Nav
              isCollapsed={isCollapsed}
              links={[composeLink]}
              filterLinks={false}  // Disable filtering for compose button
            />
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={mainLinks}
            filterLinks={false}  // Disable filtering to show all tabs
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[1]}%`} minSize="30%">
          <Tabs defaultValue="inbox">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold capitalize">
                {mail.selectedTab || 'Inbox'}
              </h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Sent
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground py-1">
              Showing all emails
            </div>
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="inbox" className="m-0">
              <div className="flex items-center p-2">
                <MailList items={inboxMails} />
              </div>
            </TabsContent>
            <TabsContent value="sent" className="m-0">
              <div className="flex items-center p-2">
                <MailList items={sentMails} />
              </div>
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <div className="flex items-center p-2">
                <MailList items={mails.filter(mail => !mail.read)} />
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[2]}%`}>
          <MailDisplay
            mail={mails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}