// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   CalendarDays,
//   CoinsIcon,
//   Facebook,
//   Instagram,
//   LayoutGrid,
//   Linkedin,
//   MoreHorizontal,
//   Twitter,
//   User,
//   Youtube,
// } from "lucide-react";
// import moment from "moment";
// import { prismadb } from "@/lib/prisma";
// import Link from "next/link";
// import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
// import { Badge } from "@/components/ui/badge";

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
//                 {data.first_name} {data.last_name}
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
//           <div className="grid grid-cols-2 w-full ">
//             <div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Account</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.assigned_accounts?.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Position</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.position ? data.position : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Birthday</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.birthday
//                       ? moment(data.birthday).format("MMM DD YYYY")
//                       : "N/A"}
//                   </p>
//                 </div>
//               </div>
//               <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">
//                     Description
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.description ? data.description : "N/A"}
//                   </p>
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
//                 <CoinsIcon className="mt-px h-5 w-5" />
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium leading-none">Status</p>
//                   <p className="text-sm text-muted-foreground">
//                     {data.status ? "Active" : "Inactive"}
//                   </p>
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
//             <div className="flex flex-col gap-2">
//               <div> Tags:</div>
//               <div className="flex flex-wrap gap-2">
//                 {data.tags.map((tag: string) => (
//                   <Badge key={tag} variant={"outline"}>
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//       <div className="grid grid-cols-2 gap-3 w-full">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle>Contacts</CardTitle>
//           </CardHeader>
//           <CardContent className="gap-1">
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">E-mail</p>
//                 {data?.email ? (
//                   <Link
//                     href={`mailto:${data.email}`}
//                     className="flex items-center  gap-5 text-sm text-muted-foreground"
//                   >
//                     {data.email}
//                     <EnvelopeClosedIcon />
//                   </Link>
//                 ) : null}
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">
//                   Personal e-mail
//                 </p>
//                 {data?.personal_email ? (
//                   <Link
//                     href={`mailto:${data.personal_email}`}
//                     className="flex items-center  gap-5 text-sm text-muted-foreground"
//                   >
//                     {data.personal_email}
//                     <EnvelopeClosedIcon />
//                   </Link>
//                 ) : null}
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Office phone</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.office_phone}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Mobile phone</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.mobile_phone}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Website</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data?.website ? (
//                     <Link href={data.website}>{data.website}</Link>
//                   ) : (
//                     "N/A"
//                   )}
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
//             <CardTitle>Social networks</CardTitle>
//           </CardHeader>
//           <CardContent className="gap-1">
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <Twitter className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Twitter</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_twitter}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <Facebook className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Facebook</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_facebook}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <Linkedin className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">LinkedIn</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_linkedin}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <LayoutGrid className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Skype</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_skype}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <Instagram className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">Instagram</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_instagram}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <Youtube className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">YouTube</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_youtube}
//                 </p>
//               </div>
//             </div>
//             <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
//               <LayoutGrid className="mt-px h-5 w-5" />
//               <div className="space-y-1">
//                 <p className="text-sm font-medium leading-none">TikTok</p>
//                 <p className="text-sm text-muted-foreground">
//                   {data.social_tiktok}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//       <div>
//         {
//           //TODO: Add notes functionality
//           //TODO: Delete notes functionality
//         }
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle>Notes</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-1">
//               {data.notes.map((note: string) => (
//                 <p className="text-sm text-muted-foreground" key={note}>
//                   {note}
//                 </p>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { prismadb } from "@/lib/prisma";

import {
  CalendarDays,
  Briefcase,
  Building2,
  Cake,
  FileText,
  User,
  Clock,
  Activity,
  Tag,
  Users,
  Factory,
  Copy,
  Check,
  Mail,
  Phone,
  Smartphone,
  Globe,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  LayoutGrid,
  StickyNote,
  ChevronRight,
  Pen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CopyIdButton from "./CopyIdButton";

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function FieldCell({
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

function SocialPill({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground">
      {icon}
      {value}
    </div>
  );
}

interface OppsViewProps {
  data: any;
}
export async function BasicView({ data }: OppsViewProps) {
  //console.log(data, "data");
  const users = await prismadb.users.findMany();
  if (!data) return <div>Opportunity not found</div>;

  const findUser = (id: string) => users.find((u) => u.id === id)?.name || "—";

  const initials = `${data.first_name?.[0] || ""}${data.last_name?.[0] || ""}`;

  const socialLinks = [
    { icon: <Twitter className="h-3.5 w-3.5" />, value: data.social_twitter },
    { icon: <Facebook className="h-3.5 w-3.5" />, value: data.social_facebook },
    { icon: <Linkedin className="h-3.5 w-3.5" />, value: data.social_linkedin },
    {
      icon: <Instagram className="h-3.5 w-3.5" />,
      value: data.social_instagram,
    },
    { icon: <Youtube className="h-3.5 w-3.5" />, value: data.social_youtube },
    { icon: <LayoutGrid className="h-3.5 w-3.5" />, value: data.social_skype },
    { icon: <LayoutGrid className="h-3.5 w-3.5" />, value: data.social_tiktok },
  ];

  const hasSocials = socialLinks.some((s) => s.value);

  return (
    <div className="w-full border-border/60">
      {/* Breadcrumb */}
      {/* <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <span className="hover:text-foreground cursor-pointer transition-colors">
          Contacts
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">
          {data.first_name} {data.last_name}
        </span>
      </div> */}

      {/* Hero header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold tracking-tight shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {data.first_name} {data.last_name}
              </h1>
              <Badge
                variant={data.status ? "default" : "secondary"}
                className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5"
              >
                {data.status ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {data.position}{" "}
              {data.assigned_accounts?.name
                ? `at ${data.assigned_accounts.name}`
                : ""}
            </p>
            <button              
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground font-mono transition-colors"
            >
              <CopyIdButton id={data.id} />
              
            </button>
          </div>
        </div>
        {/* <button className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-2 transition-colors hover:bg-muted/50">
          <Pen className="h-3.5 w-3.5" />
          Edit
        </button> */}
      </div>

      {/* Tags row */}
      {data.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          {data.tags.map((tag: any) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[11px] font-medium px-3 py-1 rounded-md bg-muted/30"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator className="mb-8" />

      {/* Grid sections */}
      <div className="space-y-10">
        {/* General Information */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            General Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
            <FieldCell label="First Name" value={data.first_name} />
            <FieldCell label="Last Name" value={data.last_name} />
            <FieldCell label="Account" value={data.assigned_accounts?.name} />
            <FieldCell label="Position" value={data.position} />
            <FieldCell label="Birthday" value={formatDate(data.birthday)} />
            <FieldCell label="Type" value={data.type} />
            <FieldCell label="Member of" value={data.member_of} />
            <FieldCell label="Industry" value={data.industry} />
          </div>
        </section>

        {/* Contact Details */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Contact Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 bg-card rounded-xl border border-border/50 px-6 py-2">
            <FieldCell
              label="Email"
              value={
                data.email ? (
                  <a
                    href={`mailto:${data.email}`}
                    className="text-primary hover:underline"
                  >
                    {data.email}
                  </a>
                ) : undefined
              }
            />
            <FieldCell
              label="Personal Email"
              value={
                data.personal_email ? (
                  <a
                    href={`mailto:${data.personal_email}`}
                    className="text-primary hover:underline"
                  >
                    {data.personal_email}
                  </a>
                ) : undefined
              }
            />
            <FieldCell label="Office Phone" value={data.office_phone} />
            <FieldCell label="Mobile Phone" value={data.mobile_phone} />
            <FieldCell
              label="Website"
              value={
                data.website ? (
                  <a
                    href={data.website}
                    className="text-primary hover:underline"
                  >
                    {data.website}
                  </a>
                ) : undefined
              }
            />
            <FieldCell label="Billing Country" value={data.billing_country} />
          </div>
        </section>

        {/* Social Networks */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            Social Networks
          </h2>
          <div className="bg-card rounded-xl border border-border/50 px-6 py-5">
            {hasSocials ? (
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map((s, i) => (
                  <SocialPill key={i} icon={s.icon} value={s.value} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/40">
                No social profiles linked
              </p>
            )}
          </div>
        </section>

        {/* Description & Notes */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5" />
            Description & Notes
          </h2>
          <div className="bg-card rounded-xl border border-border/50 px-6 py-5 space-y-4">
            {data.description && (
              <p className="text-sm text-foreground leading-relaxed">
                {data.description}
              </p>
            )}
            {data.notes.length > 0 && (
              <div className="space-y-2 pt-2">
                {data.notes.map((note : any, i: any) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Metadata footer */}
        <section>
          <div className="flex flex-wrap gap-x-10 gap-y-2 text-[11px] text-muted-foreground/60 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" />
              Created {formatDate(data.created_on)} by{" "}
              {findUser(data.createdBy)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Updated {formatDate(data.updatedAt)} by {findUser(data.updatedBy)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Assigned to {findUser(data.assigned_to)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
