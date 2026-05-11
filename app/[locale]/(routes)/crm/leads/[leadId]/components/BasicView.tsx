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
