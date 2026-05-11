import {
  DollarSign,
  Target,
  ClipboardList,
  CalendarDays,
  User,
  Building2,
  Globe2,
  Megaphone,
  FileText,
  BadgePercent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prismadb } from "@/lib/prisma";
import CopyIdButton from "./CopyIdButton";
import { getMarketingCampaign } from "@/actions/marketing/get-marketing-campaign";

interface OppsViewProps {
  data: {
    assigned_sales_stage: { name: string };
    assigned_to_user: { name: string };
    assigned_account: { name: string };
    assigned_type: { name: string };
  } & import("@prisma/client").crm_Opportunities;
}

// ── Helpers ─────────────────────────────────────────────────
function formatDate(dateStr: string | undefined | Date) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`py-3 ${className}`}>
      <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="text-sm text-foreground font-medium">
        {value || <span className="text-muted-foreground/40">—</span>}
      </div>
    </div>
  );
}

export async function BasicView({ data }: OppsViewProps) {
  const users = await prismadb.users.findMany();
  if (!data) return <div>Opportunity not found</div>;

  const findUser = (id: string) =>
    users.find((u: any) => u.id === id)?.name || "—";

  // Generate initials from opportunity name
  const initials = (data.name?.[0] || "O").toUpperCase();

  // Format budget as currency
  const budget = data.budget
    ? Number(data.budget).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    : undefined;

  let campaignName: string | null = null;
  if (data.campaign) {
    const campaign = await getMarketingCampaign(data.campaign);
    campaignName = campaign?.name ?? "-";
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-green-600 flex items-center justify-center text-white text-lg font-bold tracking-tight shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {data.name}
              </h1>
              {data.status && (
                <Badge className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5">
                  {data.status}
                </Badge>
              )}
            </div>
            <CopyIdButton id={data.id} />
          </div>
        </div>
      </div>
      <Separator />

      {/* ── Opportunity Details ────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <Target className="h-3.5 w-3.5" />
          Opportunity Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
          <Field label="Amount" value={budget} />
          <Field
            label="Sales Stage"
            value={data.assigned_sales_stage?.name || "Not assigned"}
          />
          <Field label="Type" value={data.assigned_type?.name || "N/A"} />
          <Field label="Next Step" value={data.next_step} />
          {/* <Field
            label="Expected Close"
            value={formatDate(data.close_date)}
          /> */}
          {/* <Field
            label="Lead Source"
            value={data.lead_source || "—"}
          /> */}
          <Field label="Campaign" value={campaignName} />
        </div>
      </section>

      {/* ── Relationship ─────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5" />
          Relationship
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
          <Field
            label="Account"
            value={data.assigned_account?.name || "Not assigned"}
          />
          <Field
            label="Assigned To"
            value={data.assigned_to_user?.name || "—"}
          />
        </div>
      </section>

      {/* ── Description ────────────────────────────────── */}
      {data.description && (
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Description / Notes
          </h2>
          <div className="bg-card rounded-xl border border-border/50 px-6 py-5">
            <p className="text-sm text-foreground leading-relaxed">
              {data.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Metadata Footer ────────────────────────────── */}
      <div className="flex flex-wrap gap-x-10 gap-y-2 text-[13px] text-foreground/60 pt-2">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" />
          Created {formatDate(data.createdAt)} by{" "}
          {/* {findUser(data.createdBy) */}
        </span>
        {/*         <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" />
          Updated {formatDate(data.updatedAt)} by {findUser(data.updatedBy)}
        </span> */}
      </div>
    </div>
  );
}
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { crm_Opportunities } from "@prisma/client";
// import {
//   CalendarDays,
//   ClipboardList,
//   CoinsIcon,
//   Combine,
//   Landmark,
//   List,
//   SquareStack,
//   Text,
//   User,
// } from "lucide-react";
// import moment from "moment";
// import { Clapperboard } from "lucide-react";
// import { prismadb } from "@/lib/prisma";

// interface OppsViewProps {
//   data: {
//     assigned_sales_stage: { name: string };
//     assigned_to_user: { name: string };
//     assigned_account: { name: string };
//     assigned_type: { name: string };
//   } & crm_Opportunities;
// }

// export async function BasicView({ data }: OppsViewProps) {
//   //console.log(data, "data");
//   const users = await prismadb.users.findMany();
//   if (!data) return <div>Opportunity not found</div>;
//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle>{data.name}</CardTitle>
//         <CardDescription>ID:{data.id}</CardDescription>
//       </CardHeader>
//       <CardContent className="grid grid-cols-2 gap-1">
//         <div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <CoinsIcon className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">
//                 Opportunity amount
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 {data.budget ? Number(data.budget).toLocaleString("en-US", {
//                   style: "currency",
//                   currency: "USD",
//                 }) : "N/A"}
//               </p>
//             </div>
//           </div>

//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <SquareStack className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Sales stage</p>
//               <p className="text-sm text-muted-foreground">
//                 {data.assigned_sales_stage?.name
//                   ? data.assigned_sales_stage?.name
//                   : "Not assigned"}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <Combine className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Next step</p>
//               <p className="text-sm text-muted-foreground">{data.next_step}</p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <ClipboardList className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Description</p>
//               <p className="text-sm text-muted-foreground">
//                 {data.description}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <User className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Assigned to</p>
//               <p className="text-sm text-muted-foreground">
//                 {data.assigned_to_user.name}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <Landmark className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Account name</p>
//               <p className="text-sm text-muted-foreground">
//                 {data.assigned_account?.name
//                   ? data.assigned_account?.name
//                   : "Not assigned"}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <CalendarDays className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">
//                 Expected close date
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 {moment(data.close_date).format("MMM DD YYYY")}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <CalendarDays className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Date created</p>
//               <p className="text-sm text-muted-foreground">
//                 {moment(data.createdAt).format("MMM DD YYYY")}
//               </p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Created by</p>
//               <p className="text-sm text-muted-foreground">
//                 {users.find((user) => user.id === data.createdBy)?.name}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <CalendarDays className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Last update</p>
//               <p className="text-sm text-muted-foreground">
//                 {moment(data.updatedAt).format("MMM DD YYYY")}
//               </p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Last update by</p>
//               <p className="text-sm text-muted-foreground">
//                 {users.find((user) => user.id === data.updatedBy)?.name}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <List className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Type</p>
//               <p className="text-sm text-muted-foreground">
//                 {data.assigned_type?.name ? data.assigned_type?.name : "N/A"}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <Landmark className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Lead source</p>
//               <p className="text-sm text-muted-foreground">
//                 Will be added in the future
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <Clapperboard className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Campaign</p>
//               <p className="text-sm text-muted-foreground">
//                 Will be added in the future
//               </p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
