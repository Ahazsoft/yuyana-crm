// @ts-nocheck
"use client";

import { format } from "date-fns";
import { useState } from "react";
import {
  Archive,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  messageId?: string;
  references?: string;
};

interface MailDisplayProps {
  mail: Mail | null;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<string | null>(null);

  const displayName = mail?.name
    ? mail.name.replace(/(^\"+|\"+$)/g, "").trim()
    : "";
  const displaySubject = mail?.subject
    ? mail.subject.replace(/(^\"+|\"+$)/g, "").trim()
    : "";

  const handleSendReply = async () => {
    if (!mail || !replyText.trim() || isSending) return;
    setIsSending(true);
    setSentStatus(null);

    try {
      const res = await fetch("/api/marketing/reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mail.email,                // the original sender
          subject: mail.subject,         // will be prefixed by the server if needed
          html: replyText,               // or could be plain text
          text: replyText,
          originalMessageId: mail.messageId,
          references: mail.references,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to send reply");
      }

      setSentStatus("Reply sent ✅");
      setReplyText("");                   // clear the input
    } catch (err: any) {
      console.error(err);
      setSentStatus(err.message || "Error sending reply");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ minHeight: "50vh", maxHeight: "100vh" }}>
      {/* ... toolbar unchanged ... */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Reply button now simply focuses the textarea – you can also start composing */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail}
                onClick={() => {
                  if (mail) {
                    // Optionally pre‑fill the subject – we already have it
                    const subjectField = document.querySelector<HTMLTextAreaElement>(
                      'textarea[placeholder^="Reply"]'
                    );
                    subjectField?.focus();
                  }
                }}
              >
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />

      {/* ... mail header + body unchanged ... */}
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  
                  {mail.name.split(" ")[0].charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold max-w-[60%] truncate">
                  {displayName}
                </div>
                <div className="line-clamp-1 text-xs max-w-[60%] truncate">
                  {displaySubject}
                </div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.date), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div
            className="flex-1 whitespace-pre-wrap p-4 text-sm overflow-y-auto"
            style={{ maxHeight: "40vh", minHeight: "40vh" }}
          >
            {mail.text}
          </div>
          <Separator className="mt-auto" />

          {/* Reply form */}
          <div className="p-4">
            <div className="flex flex-row gap-5">
              <Textarea
                className="p-4"
                placeholder={`Reply ${mail.name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex flex-col items-end gap-2">
                <Button
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSending}
                >
                  {isSending ? "Sending..." : "Send"}
                </Button>
                {/* {sentStatus && (
                  <span className="text-xs text-muted-foreground">
                    {sentStatus}
                  </span>
                )} */}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}

// // @ts-nocheck
// import { format } from "date-fns";
// import { addDays } from "date-fns";

// import {
//   Archive,
//   Forward,
//   MoreVertical,
//   Reply,
//   ReplyAll,
//   Trash2,
// } from "lucide-react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// type Mail = {
//   id: string;
//   name?: string;
//   email?: string;
//   subject?: string;
//   text?: string;
//   date?: string;
//   read?: boolean;
//   labels?: string[];
//   type?: string;
//   messageId?: string;
//   references?: string;
// };

// interface MailDisplayProps {
//   mail: Mail | null;
// }

// export function MailDisplay({ mail }: MailDisplayProps) {
//   const today = new Date();

//   const displayName = mail?.name
//     ? mail.name.replace(/(^\"+|\"+$)/g, "").trim()
//     : "";
//   const displaySubject = mail?.subject
//     ? mail.subject.replace(/(^\"+|\"+$)/g, "").trim()
//     : "";

//   return (
//     <div
//       className="flex h-full flex-col"
//       style={{ minHeight: "50vh", maxHeight: "100vh" }}
//     >
//       <div className="flex items-center p-2">
//         <div className="flex items-center gap-2">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" disabled={!mail}>
//                 <Archive className="h-4 w-4" />
//                 <span className="sr-only">Archive</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Archive</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" disabled={!mail}>
//                 <Trash2 className="h-4 w-4" />
//                 <span className="sr-only">Move to trash</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Move to trash</TooltipContent>
//           </Tooltip>
//           <Separator orientation="vertical" className="mx-1 h-6" />
//         </div>
//         <div className="ml-auto flex items-center gap-2">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" disabled={!mail}>
//                 <Reply className="h-4 w-4" />
//                 <span className="sr-only">Reply</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Reply</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" disabled={!mail}>
//                 <ReplyAll className="h-4 w-4" />
//                 <span className="sr-only">Reply all</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Reply all</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="ghost" size="icon" disabled={!mail}>
//                 <Forward className="h-4 w-4" />
//                 <span className="sr-only">Forward</span>
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Forward</TooltipContent>
//           </Tooltip>
//         </div>
//         <Separator orientation="vertical" className="mx-2 h-6" />
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon" disabled={!mail}>
//               <MoreVertical className="h-4 w-4" />
//               <span className="sr-only">More</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem>Mark as unread</DropdownMenuItem>
//             <DropdownMenuItem>Star thread</DropdownMenuItem>
//             <DropdownMenuItem>Add label</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//       <Separator />
//       {mail ? (
//         <div className="flex flex-1 flex-col">
//           <div className="flex items-start p-4">
//             <div className="flex items-start gap-4 text-sm">
//               <Avatar>
//                 <AvatarImage alt={mail.name} />
//                 <AvatarFallback>
//                   {mail.name.split(" ")[0].charAt(0).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>
//               <div className="grid gap-1">
//                 <div className="font-semibold max-w-[60%] truncate">
//                   {displayName}
//                 </div>
//                 <div className="line-clamp-1 text-xs max-w-[60%] truncate">
//                   {displaySubject}
//                 </div>
//                 <div className="line-clamp-1 text-xs">
//                   <span className="font-medium">Reply-To:</span> {mail.email}
//                 </div>
//               </div>
//             </div>
//             {mail.date && (
//               <div className="ml-auto text-xs text-muted-foreground">
//                 {format(new Date(mail.date), "PPpp")}
//               </div>
//             )}
//           </div>
//           <Separator />
//           <div
//             className="flex-1 whitespace-pre-wrap p-4 text-sm overflow-y-auto"
//             style={{ maxHeight: "40vh", minHeight: "40vh" }}
//           >
//             {mail.text}
//           </div>
//           <Separator className="mt-auto" />
//           <div className="p-4">
//             <form>
//               <div className="flex flex-row gap-5 ">
//                 <Textarea
//                   className="p-4"
//                   placeholder={`Reply ${mail.name}...`}
//                 />
//                 <div className="flex items-end">
//                   <Button size="sm" className="ml-auto" onClick={() => {

//                   }}>
//                     Send
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       ) : (
//         <div className="p-8 text-center text-muted-foreground">
//           No message selected
//         </div>
//       )}
//     </div>
//   );
// }
