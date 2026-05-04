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

import { AccountSwitcher } from "@/app/[locale]/(routes)/marketing/emails/components/account-switcher";
import { MailDisplay } from "@/app/[locale]/(routes)/marketing/emails/components/mail-display";
import { MailList } from "@/app/[locale]/(routes)/marketing/emails/components/mail-list";
import { Nav } from "@/app/[locale]/(routes)/marketing/emails/components/nav";
// Mail shape expected by UI
type MailType = {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  text?: string;
  date?: string;
  read?: boolean;
  labels?: string[];
  type?: string; // 'inbox' | 'sent'
};
import { useMail } from "@/app/[locale]/(routes)/marketing/emails/use-mail";
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

  // local state so we can poll the API route client-side
  const [localMails, setLocalMails] = React.useState<MailType[]>(mails || []);

  // Poll /api/imap/fetch to refresh mailbox (uses server API route + lib/imap)
  React.useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const res = await fetch("/api/imap/fetch?limit=50", {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        const fetched = json?.data || { INBOX: [], SENT: [] };

        const inbox = fetched.INBOX || [];
        const sent = fetched.SENT || [];

        const mapped: MailType[] = [
          ...inbox.map((m: any) => ({
            id: `inbox_${m.id}`,
            name: (m.from || m.to?.[0] || "Unknown")
              .split(" <")[0]
              .replace(/(^\"+|\"+$)/g, "")
              .trim(),
            email:
              (m.from || "").match(/<(.*)>/)?.[1] || m.from || m.to?.[0] || "",
            subject: (m.subject || "(no subject)")
              .replace(/(^\"+|\"+$)/g, "")
              .trim(),
            text: m.text || m.html || "",
            date: m.date || new Date().toISOString(),
            // use IMAP seen flag for inbox; default to false
            read: !!m.seen,
            labels: [],
            type: "inbox",
          })),
          ...sent.map((m: any) => {
            const rawTo = Array.isArray(m.to) ? m.to[0] : m.to || "";
            const toName = rawTo
              .split(" <")[0]
              .replace(/(^\"+|\"+$)/g, "")
              .trim();
            const toEmail = rawTo.match(/<(.*)>/)?.[1] || rawTo || "";

            return {
              id: `sent_${m.id}`,
              name: toName || "Unknown",
              email: toEmail,
              subject: (m.subject || "(no subject)")
                .replace(/(^\"+|\"+$)/g, "")
                .trim(),
              text: m.text || m.html || "",
              date: m.date || new Date().toISOString(),
              read: true,
              labels: [],
              type: "sent",
            };
          }),
        ];

        if (mounted) setLocalMails(mapped);
      } catch (e) {
        // ignore errors silently
      }
    }

    // initial refresh
    refresh();
    const id = setInterval(refresh, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  React.useEffect(() => {
    // prefer any selected, otherwise pick first from localMails then props
    if (!mail.selected) {
      if (localMails && localMails.length) {
        mail.setSelected(localMails[0].id);
      } else if (mails && mails.length) {
        mail.setSelected(mails[0].id);
      }
    }
  }, [mails, localMails]);

  // Calculate counts from local state
  const inboxMails = localMails.filter((m) => m.type === "inbox");
  const sentMails = localMails.filter((m) => m.type === "sent");
  const unreadMailsCount = inboxMails.filter((m) => !m.read).length;
  const inboxMailsCount = inboxMails.length;
  const sentMailsCount = sentMails.length;

  // Separate compose link from inbox/sent links
  // const composeLink = {
  //   title: "Compose",
  //   label: "",
  //   icon: PenBox,
  //   variant: "ghost",
  // };

  // const mainLinks = [
  //   {
  //     title: "Inbox",
  //     label: `${inboxMailsCount}`, // Show inbox count
  //     icon: Inbox ,
  //     variant: "default",
  //   },
  //   {
  //     title: "Sent",
  //     label: `${sentMailsCount}`, // Show sent count
  //     icon: Send ,
  //     variant: "ghost",
  //   },
  //   {
  //     title: "Unread",
  //     label: `${unreadMailsCount}`, // Show unread count
  //     icon: Mail, // Using Mail icon for Unread
  //     variant: "ghost",
  //   },
  // ];

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChange={(layout) => {
          // Convert v4 layout object to array format for storage
          const layoutArray = Object.values(layout);
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            layoutArray,
          )}`;
        }}
        className="h-full flex-row"
      >
        {/* <ResizablePanel
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
              links={[composeLink] as any}
              filterLinks={false}  // Disable filtering for compose button
            />
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={mainLinks as any} 
            filterLinks={false}  // Disable filtering to show all tabs
          />
        </ResizablePanel> */}

        {/* Lists of Emails */}
        {/* <ResizableHandle withHandle /> */}
        <ResizablePanel
          defaultSize={`${defaultLayout[1]}%`}
          minSize="30%"
          // maxSize="30%"
        >
          <Tabs
            value={mail.selectedTab || "inbox"}
            onValueChange={(v) => mail.setSelectedTab(v)}
          >
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold capitalize">
                {(mail.selectedTab || "inbox").charAt(0).toUpperCase() +
                  (mail.selectedTab || "inbox").slice(1)}
              </h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox {inboxMailsCount}
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Sent {sentMailsCount}
                </TabsTrigger>
                {/* <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread {unreadMailsCount  }
                </TabsTrigger> */}
              </TabsList>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground pt-2 px-4">
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
                <MailList items={inboxMails.filter((m) => !m.read)} />
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        {/* Selected Email Details */}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[2]}%`}>
          <MailDisplay
            mail={localMails.find((item) => item.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
