import {
  CalendarDays,
  User,
  Building2,
  Mail,
  Phone,
  Globe2,
  File,
  MapPin,
  Briefcase,
  Target,
  Zap,
  Star,
  Pen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prismadb } from "@/lib/prisma";
import CopyIdButton from "./CopyIdButton";

interface LeadsViewProps {
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

export async function BasicView({ data }: LeadsViewProps) {
  const users = await prismadb.users.findMany();
  if (!data) return <div>Lead not found</div>;
  console.log(data);

  const findUser = (id: string) =>
    users.find((u: any) => u.id === id)?.name || "—";

  // Create initials from First and Last name
  const initials =
    ((data.firstName?.[0] || "") + (data.lastName?.[0] || "")).toUpperCase() ||
    "L";

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-lg font-bold tracking-tight shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {data.firstName} {data.lastName}
              </h1>
              <Badge
                variant={data.status === "New" ? "default" : "secondary"}
                className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5"
              >
                {data.status || "N/A"}
              </Badge>
            </div>
            <CopyIdButton id={data.id} />
          </div>
        </div>
      </div>
      <Separator />
      {data.first_name} {data.last_name}
      {/* ── Lead & Professional Details ────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          Lead Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
          {/* <Field label="Company Name" value={data.company_name} />
          <Field label="Company" value={data.company_name} /> */}
          <Field label="Lead Source" value={data.lead_source} />
          {/* <Field label="Type" value={data.type} /> */}

          <Field
            label="Created"
            value={data.createdAt ? formatDate(data.createdAt) : undefined}
          />
         
          <Field
            label="Updated"
            value={data.updatedAt ? formatDate(data.createdAt) : undefined}
          />
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
          <Field label="Company Name" value={data.company} />
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
          <Field label="Phone" value={data.phone} />

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
            Description / Notes
          </h2>
          <div className="bg-card rounded-xl border border-border/50 px-6 py-5">
            <p className="text-sm text-foreground leading-relaxed">
              {data.description}
            </p>
          </div>
        </section>
      )}
      {/* ── Address ──────────────────────────────────── */}
      {(data.street || data.city) && (
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            Location
          </h2>
          <div className="bg-card rounded-xl border border-border/50 px-6 py-5">
            <div className="space-y-0.5">
              <p className="text-sm text-foreground font-medium">
                {data.street}
              </p>
              <p className="text-sm text-muted-foreground">
                {[data.city, data.state].filter(Boolean).join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                {[data.postal_code, data.country].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        </section>
      )}
      {/* ── Metadata Footer ────────────────────────────── */}
      <div className="flex flex-wrap gap-x-10 gap-y-2 text-[13px] text-foreground/60 pt-2">
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
//   Medal,
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
//               <CardTitle>
//                 {data.firstName} {data.lastName}
//               </CardTitle>
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
//                 <User className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Name</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.firstName} {data.lastName}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <Landmark className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Company name
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.company}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <Medal className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Job title</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.jobTitle ? data.jobTitle : "N/A"}
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
//                     {data?.email ? (
//                       <Link
//                         href={`mailto:${data.email}`}
//                         className="flex items-center  gap-5 text-sm text-muted-foreground"
//                       >
//                         {data.email}
//                         <EnvelopeClosedIcon />
//                       </Link>
//                     ) : null}
//                   </div>
//                 </div>
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
//                   <p className="text-sm font-medium leading-none">Phone</p>
//                   <p className="text-sm text-muted-foreground">{data.phone}</p>
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
//                     {users.find((user) => user.id === data.assigned_to)?.name}
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
//                   <p className="text-sm font-medium leading-none">
//                     Lead source
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.lead_source}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">refered_by</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.refered_by}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
