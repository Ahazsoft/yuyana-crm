import { getEmployeeActivity } from "@/actions/get-employee-activity";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/app/[locale]/(routes)/components/ui/Container2";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

const formatDate = (value?: Date | string | null) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const valueOrFallback = (value?: string | null, fallback = "Unknown") => {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
};

export default async function EmployeeActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/employees");
  }

  const activityData = await getEmployeeActivity(id);

  if (!activityData) {
    notFound();
  }

  const employee = activityData.employee;
  const sections = [
    {
      id: "accounts",
      title: "Accounts",
      description: "Accounts created by this employee",
      items: activityData.activity.filter((item) => item.type === "account"),
      emptyMessage: "No accounts created yet.",
    },
    {
      id: "contacts",
      title: "Contacts",
      description: "Contacts created by this employee",
      items: activityData.activity.filter((item) => item.type === "contact"),
      emptyMessage: "No contacts created yet.",
    },
    {
      id: "leads",
      title: "Leads",
      description: "Leads created by this employee",
      items: activityData.activity.filter((item) => item.type === "lead"),
      emptyMessage: "No leads created yet.",
    },
    {
      id: "opportunities",
      title: "Opportunities",
      description: "Opportunities created by this employee",
      items: activityData.activity.filter(
        (item) => item.type === "opportunity",
      ),
      emptyMessage: "No opportunities created yet.",
    },
    {
      id: "contracts",
      title: "Contracts",
      description: "Contracts created by this employee",
      items: activityData.activity.filter((item) => item.type === "contract"),
      emptyMessage: "No contracts created yet.",
    },
  ];

  return (
    <Container
      title={`${valueOrFallback(employee.name, employee.username ?? "Employee")} Activity`}
      description={`All CRM entries created by ${valueOrFallback(employee.name, employee.email)}.`}
      buttonComponent={
        <Button asChild variant="outline">
          <Link href="/employees">Back to employees</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Employee
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {valueOrFallback(
                employee.name,
                employee.username ?? employee.email,
              )}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {employee.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{employee.role}</Badge>
              <Badge variant="secondary">{employee.userStatus}</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">
                  {valueOrFallback(employee.username, "-")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {valueOrFallback(employee.phone, "-")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">Summary</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total entries</span>
                <span className="font-semibold">
                  {activityData.activity.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last login</span>
                <span className="font-semibold">
                  {employee.lastLoginAt
                    ? formatDate(employee.lastLoginAt)
                    : "Never"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Created</span>
                <span className="font-semibold">
                  {formatDate(employee.created_on)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.id} className="rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>{" "}
                  {/* bigger */}
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <Badge variant="secondary">{section.items.length}</Badge>
              </div>

              {section.items.length === 0 ? (
                <div className="px-4 py-8 text-sm text-muted-foreground">
                  {section.emptyMessage}
                </div>
              ) : (
                <div className="divide-y">
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      href="#"
                      className="block px-3 py-2 transition hover:bg-muted/40" // smaller padding
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>{" "}
                          {/* relatively smaller */}
                          <p className="text-sm text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </div>
                        <div className="text-right">
                          {item.status ? (
                            <Badge variant="outline">{item.status}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No status
                            </span>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
