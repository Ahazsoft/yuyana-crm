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
//   File,
//   Globe,
//   Globe2,
//   Landmark,
//   List,
//   MoreHorizontal,
//   Percent,
//   Phone,
//   SquareStack,
//   Text,
//   User,
// } from "lucide-react";
// import moment from "moment";
// import { Clapperboard } from "lucide-react";
// import { prismadb } from "@/lib/prisma";
// import Link from "next/link";
// import { EnvelopeClosedIcon, LightningBoltIcon } from "@radix-ui/react-icons";
// import { LucideLandmark } from "lucide-react";

// interface OppsViewProps {
//   data: any;
// }

// export async function BasicView({ data }: OppsViewProps) {
//   //console.log(data, "data");
//   const users = await prismadb.users.findMany();
//   if (!data) return <div>Opportunity not found</div>;
//   return (
//     <div className="pb-3 space-y-5">
//       {/*      <pre>{JSON.stringify(data, null, 2)}</pre> */}
//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex w-full justify-between">
//             <div>
//               <CardTitle>{data.name}</CardTitle>
//               <CardDescription>ID:{data.id}</CardDescription>
//             </div>
//             <div>
//               {
//                 //TODO: Add menu
//                 //TODO: Add edit button
//               }
//               <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 w-full gap-5 ">
//             <div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Annual revenue
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.annual_revenue}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <Landmark className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Company ID</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.company_id}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <Percent className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">VAT number</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.vat ? data.vat : "Not assigned"}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <File className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Description
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.description}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start justify-between space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <div className="flex mt-px gap-5">
//                   <EnvelopeClosedIcon className="mt-px h-5 w-5" />
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium leading-none">Email</p>

//                     <Link
//                       href={`mailto:${data.email}`}
//                       className="flex items-center  gap-5 text-sm text-muted-foreground"
//                     >
//                       {data.email}
//                       <EnvelopeClosedIcon />
//                     </Link>
//                   </div>
//                 </div>
//                 <p className="pr-20"></p>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <Globe2 className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Website</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data?.website ? (
//                       <Link href={data.website}>{data.website}</Link>
//                     ) : (
//                       "N/A"
//                     )}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <Phone className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Office phone
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.office_phone}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Fax</p>
//                   <p className="text-sm text-muted-foreground">{data.fax}</p>
//                 </div>
//               </div>
//             </div>
//             <div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <User className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Assigned to
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.assigned_to_user.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CalendarDays className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Created</p>
//                   <p className="text-sm text-muted-foreground">
//                     {moment(data.created_on).format("MMM DD YYYY")}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Created by</p>
//                   <p className="text-sm text-muted-foreground">
//                     {users.find((user) => user.id === data.createdBy)?.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CalendarDays className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Last update
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {moment(data.updatedAt).format("MMM DD YYYY")}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Last update by
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {users.find((user) => user.id === data.updatedBy)?.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <LightningBoltIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Status</p>
//                   <p className="text-sm text-muted-foreground">{data.status}</p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Type</p>
//                   <p className="text-sm text-muted-foreground">{data.type}</p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Member of</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.member_of}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Industry</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.industry}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//       <div className="grid grid-cols-2 gap-3 w-full">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle>Billing Address</CardTitle>
//           </CardHeader>
//           <CardContent className="gap-1">
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Billing street
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.billing_street}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Billing postal code
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.billing_postal_code}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Billing city</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.billing_city}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Billing state
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.billing_state}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Billing country
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.billing_country}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle>Shipping Address</CardTitle>
//           </CardHeader>
//           <CardContent className="gap-1">
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Shipping street
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.shipping_street}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Shipping postal code
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.shipping_postal_code}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Shipping city
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.shipping_city}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Shipping state
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.shipping_state}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Shipping country
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.shipping_country}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//     /*     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle>{data.name}</CardTitle>
//         <CardDescription>ID:{data.id}</CardDescription>
//       </CardHeader>
//       <CardContent className="grid grid-cols-2 gap-1">
//         <pre>{JSON.stringify(data, null, 2)}</pre>
//         <div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">

//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">
//                 Opportunity amount
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 {data.budget ? (typeof data.budget === 'bigint' ? data.budget.toString() : data.budget) : "N/A"}
//               </p>
//             </div>
//           </div>

//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <SquareStack className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Sales stage</p>
//               <p className="text-sm text-muted-foreground"></p>
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
//               <p className="text-sm text-muted-foreground"></p>
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
//               <p className="text-sm font-medium leading-none">Created</p>
//               <p className="text-sm text-muted-foreground">
//                 {moment(data.created_on).format("MMM DD YYYY")}
//               </p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Created by</p>
//               <p className="text-sm text-muted-foreground">
//                 {users.find((user) => user.id === data.created_by)?.name}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <CalendarDays className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Last update</p>
//               <p className="text-sm text-muted-foreground">
//                 {moment(data.last_activity).format("MMM DD YYYY")}
//               </p>
//             </div>
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Last update by</p>
//               <p className="text-sm text-muted-foreground">
//                 {users.find((user) => user.id === data.last_activity_by)?.name}
//               </p>
//             </div>
//           </div>
//           <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//             <List className="mt-px h-5 w-5" />
//             <div className="space-y-1">
//               <p className="text-sm font-medium leading-none">Type</p>
//               <p className="text-sm text-muted-foreground"></p>
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
//     </Card> */
//   );
// }

import {
  CalendarDays,
  Building2,
  CoinsIcon,
  Copy,
  Check,
  File,
  Globe2,
  Landmark,
  Mail,
  MapPin,
  MoreHorizontal,
  Percent,
  Phone,
  Truck,
  User,
  Zap,
  Factory,
  Users,
  Pen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prismadb } from "@/lib/prisma";

import CopyIdButton from "./CopyIdButton";
import { id } from "date-fns/locale";

interface OppsViewProps {
  data: any;
}

// ── Helpers ─────────────────────────────────────────────────

function formatDate(dateStr: string | undefined) {
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

function AddressCard({
  title,
  icon,
  street,
  postalCode,
  city,
  state,
  country,
}: {
  title: string;
  icon: React.ReactNode;
  street?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
}) {
  const line1 = street || "";
  const line2 = [city, state].filter(Boolean).join(", ");
  const line3 = [postalCode, country].filter(Boolean).join(" · ");
  const hasAddress = street || city || state || postalCode || country;

  return (
    <div className="bg-card rounded-xl border border-border/50 px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">
          {title}
        </h3>
      </div>
      {hasAddress ? (
        <div className="space-y-0.5">
          {line1 && (
            <p className="text-sm text-foreground font-medium">{line1}</p>
          )}
          {line2 && <p className="text-sm text-muted-foreground">{line2}</p>}
          {line3 && <p className="text-sm text-muted-foreground">{line3}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/40">No address provided</p>
      )}
    </div>
  );
}

export async function BasicView({ data }: OppsViewProps) {
  //console.log(data, "data");
  const users = await prismadb.users.findMany();
  if (!data) return <div>Opportunity not found</div>;

  const findUser = (id: string) => users.find((u) => u.id === id)?.name || "—";
  const initials = data.name?.slice(0, 2).toUpperCase() || "AC";

  const industryName = await prismadb.crm_Industry_Type.findUnique({
    where: {
      id: data.industry,
    },
  });
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold tracking-tight shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {data.name}
              </h1>
              <Badge
                variant={data.status === "Active" ? "default" : "secondary"}
                className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5"
              >
                {data.status || "N/A"}
              </Badge>
            </div>
            <CopyIdButton id={data.id} />
          </div>
        </div>
        {/* <button className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-2 transition-colors hover:bg-muted/50">
          <Pen className="h-3.5 w-3.5" />
          Edit
        </button> */}
      </div>

      <Separator />

      {/* ── Account Details ────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5" />
          Account Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
          <Field label="Annual Revenue" value={data.annual_revenue} />
          <Field label="Company ID" value={data.company_id} />
          <Field label="VAT Number" value={data.vat} />
          <Field label="Type" value={data.type} />
          <Field label="Industry" value={industryName.name} />
          <Field label="Member of" value={data.member_of} />
          <Field label="Status" value={data.status} />
          <Field label="Assigned to" value={data.assigned_to_user?.name} />
        </div>
      </section>

      {/* ── Contact Information ────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <Phone className="h-3.5 w-3.5" />
          Contact Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
          <Field
            label="Email"
            value={
              data.email ? (
                <a
                  href={`mailto:${data.email}`}
                  className="text-primary hover:underline break-all"
                >
                  {data.email}
                </a>
              ) : undefined
            }
          />
          <Field label="Office Phone" value={data.office_phone} />
          <Field label="Fax" value={data.fax} />
          <Field
            label="Website"
            value={
              data.website ? (
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {data.website}
                </a>
              ) : undefined
            }
          />
        </div>
      </section>

      {/* ── Description ────────────────────────────────── */}
      {data.description && (
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <File className="h-3.5 w-3.5" />
            Description
          </h2>
          <div className="bg-card rounded-xl border border-border/50 px-6 py-5">
            <p className="text-sm text-foreground leading-relaxed">
              {data.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Addresses ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AddressCard
          title="Billing Address"
          icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
          street={data.billing_street}
          postalCode={data.billing_postal_code}
          city={data.billing_city}
          state={data.billing_state}
          country={data.billing_country}
        />
        <AddressCard
          title="Shipping Address"
          icon={<Truck className="h-3.5 w-3.5 text-muted-foreground" />}
          street={data.shipping_street}
          postalCode={data.shipping_postal_code}
          city={data.shipping_city}
          state={data.shipping_state}
          country={data.shipping_country}
        />
      </div>

      {/* ── Metadata Footer ────────────────────────────── */}
      <div className="flex flex-wrap gap-x-10 gap-y-2 text-[11px] text-muted-foreground/60 pt-2">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" />
          Created {formatDate(data.created_on)} by {findUser(data.createdBy)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" />
          Updated {formatDate(data.updatedAt)} by {findUser(data.updatedBy)}
        </span>
      </div>
    </div>
  );
}
