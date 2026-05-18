"use client";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DiscordLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  description?: string | null;
  link?: string | null;
  createdAt: string;
  isSeen: boolean;
}

const NotificationComponent = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        const res = await fetch("/api/notification");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  function timeAgo(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }

  const handleNotificationClick = async (
    e: React.MouseEvent,
    notif: Notification,
  ) => {
    // If notification has a link, mark as read first, then navigate
    if (notif.link) {
      e.preventDefault();

      if (!notif.isSeen) {
        await markAsRead(notif.id);
      }

      router.push(notif.link);
    }
  };

  // Count unread notifications using isSeen
  const unreadCount = notifications.filter((n) => !n.isSeen).length;

  const NotificationCard = ({
    notif,
    onMarkRead,
  }: {
    notif: Notification;
    onMarkRead: (id: string) => void;
  }) => {
    const content = (
      <div className="border rounded-md p-3 hover:bg-accent transition-colors cursor-pointer space-y-2">
        {/* Top row: badge + title */}
        <div className="flex justify-start items-center gap-2">
          {!notif.isSeen && (
            <span className="h-2 w-2 rounded-full bg-violet-500" />
          )}

          {notif.link && (
            <Link
              href={notif.link}
              onClick={(e) => handleNotificationClick(e, notif)}
            >
              <h4 className="text-sm font-medium">{notif.title}</h4>
            </Link>
          )}
          {!notif.link && (
            <h4 className="text-sm font-medium">{notif.title}</h4>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground">
          {timeAgo(notif.createdAt)}
        </p>

        {notif.description && (
          <div className="flex items-end gap-2">
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
              {notif.description}
            </p>
            <div className="w-[20%] flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(notif.id);
                      }}
                      className="p-1 hover:bg-muted rounded"
                      aria-label="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark as read</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    );

    return content;
  };
  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isSeen: true } : n)),
    );

    // Call API to persist
    await fetch(`/api/notification/${id}/read`, {
      method: "PATCH",
    });
  };

  return (
    <Popover>
      <PopoverTrigger className="border rounded-md p-3 relative">
        <Bell className="cursor-pointer w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="flex flex-col space-y-2 mt-3 min-w-[400px] max-h-96 overflow-y-auto"
        align="end"
      >
        <h2 className="font-bold ">Notifications</h2>
        <hr className="mb-2" />
        {loading ? (
          <p className="text-sm text-muted-foreground px-2">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500 px-2">
            Failed to load notifications
          </p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2">
            No notifications yet
          </p>
        ) : (
          <>
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkRead={markAsRead}
              />
            ))}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationComponent;
