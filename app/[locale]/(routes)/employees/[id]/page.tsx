import { getEmployeeActivity } from "@/actions/get-employee-activity";
import { getEmployeeCharts } from "@/actions/employees/get-employee-charts";
import { getEmployeeConversionMetrics } from "@/actions/employees/get-employee-conversion-metrics";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/app/[locale]/(routes)/components/ui/Container2";
import { EmployeeReportControls } from "./employee-report-controls";
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
  const chartData = await getEmployeeCharts(id);
  const conversionMetrics = await getEmployeeConversionMetrics(id);

  return (
    <Container
      title={`${valueOrFallback(employee.name, employee.username ?? "Employee")} Activity`}
      description={`All CRM entries created by ${valueOrFallback(employee.name, employee.email)}.`}
      buttonComponent={
        <Button asChild>
          <Link href="/employees">Back to employees</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Employee Overview & Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
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

          <div className="lg:col-span-2 rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Performance Summary
            </p>
            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Total Entries</p>
                <p className="mt-1 text-2xl font-bold">
                  {chartData.totalEntries}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {chartData.timeline === "weekly" ? "Selected week" : "Selected month"}
                </p>
              </div>
              
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Total Lead Conversions</p>
                <p className="mt-1 text-2xl font-bold">
                  {conversionMetrics.conversionCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {chartData.timeline === "weekly" ? "Selected week" : "Selected month"}
                </p>
              </div>
              
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="mt-1 text-sm font-semibold">
                  {employee.lastLoginAt
                    ? formatDate(employee.lastLoginAt)
                    : "Never"}
                </p>
              </div>
              
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(employee.created_on)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <EmployeeReportControls
          employeeId={id}
          initialData={chartData}
          initialActivity={activityData.activity}
        />
      </div>
    </Container>
  );
}
