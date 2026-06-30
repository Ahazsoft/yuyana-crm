import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {
  Contact,
  DollarSignIcon,
  FilePenLine,
  HeartHandshakeIcon,
  LandmarkIcon,
  LayoutGrid,
  Lock,
  ShieldX,
  UserIcon,
  Users2Icon,
  ClipboardList,
  Briefcase,
  FileText,
  Receipt,
} from "lucide-react";
import Link from "next/link";

import Container from "./components/ui/Container";
import LoadingBox from "./components/dasboard/loading-box";
import {
  MonthlyTrendChart,
  StageBreakdownChart,
  LeadsBarChart,
  TaskStatusChart,
  GrowthMetricCard,
} from "./components/dasboard/dashboard-charts";

import {
  getTasksCount,
  getUsersTasksCount,
} from "@/actions/dashboard/get-tasks-count";
import { getModules } from "@/actions/get-modules";
import { getEmployees } from "@/actions/get-employees";
import { getLeadsCount } from "@/actions/dashboard/get-leads-count";
import { getBoardsCount } from "@/actions/dashboard/get-boards-count";
import { getContactCount } from "@/actions/dashboard/get-contacts-count";
import { getAccountsCount } from "@/actions/dashboard/get-accounts-count";
import { getContractsCount } from "@/actions/dashboard/get-contracts-count";
import { getInvoicesCount } from "@/actions/dashboard/get-invoices-count";
import { getDocumentsCount } from "@/actions/dashboard/get-documents-count";
import { getActiveUsersCount } from "@/actions/dashboard/get-active-users-count";
import { getOpportunitiesCount } from "@/actions/dashboard/get-opportunities-count";
import { getExpectedRevenue } from "@/actions/crm/opportunity/get-expected-revenue";
import { getDashboardChartData } from "@/actions/dashboard/get-dashboard-chart-data";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  href,
  title,
  value,
  sub,
  IconComponent,
  accent,
}: {
  href?: string;
  title: string;
  value: string | number;
  sub?: string;
  IconComponent: React.ElementType;
  accent: string;
}) {
  const inner = (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 h-full">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${accent}, transparent 70%)`,
        }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
          style={{ background: `${accent}22` }}
        >
          <IconComponent size={22} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-2">
      {label}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session?.user?.id;
  const isAdmin = session.user.role === "ADMIN";

  const dict = await getTranslations("DashboardPage");
  const modules = await getModules();

  // ── Non-admin gate ──────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="mx-5">
        <Container
          title={dict("containerTitle")}
          description="Welcome to Yuyana CRM cockpit, here you can see your company overview"
        >
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-full ring-1 ring-red-200 dark:ring-red-800">
                <ShieldX
                  className="w-16 h-16 text-red-500 dark:text-red-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="space-y-3 max-w-md text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Hello {session.user.name}
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <p className="text-lg">
                  You&apos;re not allowed to access this page.
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                This page is only available for administrators.
              </p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ── Fetch all data in parallel ──────────────────────────────────────────────
  const [
    leads,
    tasks,
    employees,

    projects,
    contacts,
    contracts,
    users,
    accounts,
    invoices,
    revenue,
    documents,
    opportunities,
    usersTasks,
    chartData,
  ] = await Promise.all([
    getLeadsCount(),
    getTasksCount(),
    getEmployees(),

    getBoardsCount(),
    getContactCount(),
    getContractsCount(),
    getActiveUsersCount(),
    getAccountsCount(),
    getInvoicesCount(),
    getExpectedRevenue(),
    getDocumentsCount(),
    getOpportunitiesCount(),
    getUsersTasksCount(userId),
    getDashboardChartData(),
  ]);

  const crmModule = modules.find((m) => m.name === "crm");
  const invoiceModule = modules.find((m) => m.name === "invoice");
  const projectsModule = modules.find((m) => m.name === "projects");
  const documentsModule = modules.find((m) => m.name === "documents");
  const employeesModule = modules.find((m) => m.name === "employees");

  const formattedRevenue =
    typeof revenue === "number"
      ? revenue.toLocaleString("en-US", { style: "currency", currency: "USD" })
      : "$0.00";

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-10 px-1">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <LayoutGrid className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{dict("containerTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session.user.name} — here&apos;s your company
            overview.
          </p>
        </div>
      </div>

      {/* ── Overview KPIs ── */}
      {/* <div>
        <SectionLabel label="Overview" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title={dict("totalRevenue")}
            value="$0.00"
            sub="All-time paid revenue"
            IconComponent={DollarSignIcon}
            accent="#a855f7"
          />
          <KpiCard
            title={dict("expectedRevenue")}
            value={formattedRevenue}
            sub="From open opportunities"
            IconComponent={DollarSignIcon}
            accent="#09707e"
          />
          <KpiCard
            href="/admin/users"
            title={dict("activeUsers")}
            value={users}
            sub="Active team members"
            IconComponent={UserIcon}
            accent="#92bd42"
          />
          {employeesModule?.enabled && (
            <KpiCard
              href="/employees"
              title="Employees"
              value={employees.length}
              sub="Total employees"
              IconComponent={Users2Icon}
              accent="#f97316"
            />
          )}
        </div>
      </div> */}

      {/* ── CRM Module ── */}
      {crmModule?.enabled && (
        <>
          {/* Growth Metrics KPI Cards */}
          <div>
            <SectionLabel label="Growth Analysis" />
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {chartData.growthMetrics.map((metric) => (
                <Suspense key={metric.category} fallback={<LoadingBox />}>
                  <GrowthMetricCard metric={metric} />
                </Suspense>
              ))}
            </div>
          </div>

          {/* CRM KPI row */}
          <div>
            <SectionLabel label="CRM" />
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                href="/crm/accounts"
                title={dict("accounts")}
                value={accounts}
                sub="Total accounts"
                IconComponent={LandmarkIcon}
                accent="#09707e"
              />
              <KpiCard
                href="/crm/opportunities"
                title={dict("opportunities")}
                value={opportunities}
                sub="Open opportunities"
                IconComponent={HeartHandshakeIcon}
                accent="#92bd42"
              />
              <KpiCard
                href="/crm/contacts"
                title="Customers"
                value={contacts}
                sub="Total contacts"
                IconComponent={Contact}
                accent="#a855f7"
              />
              <KpiCard
                href="/crm/leads"
                title={dict("leads")}
                value={leads}
                sub="Active leads"
                IconComponent={UserIcon}
                accent="#f97316"
              />
              <KpiCard
                href="/crm/contracts"
                title={dict("contracts")}
                value={contracts}
                sub="Total contracts"
                IconComponent={FilePenLine}
                accent="#0ea5e9"
              />
            </div>
          </div>

          {/* CRM Charts row */}
          <div>
            <SectionLabel label="CRM Analytics" />
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
              {/* Area chart spans 2 cols */}
              <div className="xl:col-span-2">
                <Suspense fallback={<LoadingBox />}>
                  <MonthlyTrendChart data={chartData.monthlyTrend} />
                </Suspense>
              </div>
              {/* Donut chart */}
              <Suspense fallback={<LoadingBox />}>
                <StageBreakdownChart data={chartData.stageBreakdown} />
              </Suspense>
            </div>
          </div>

          {/* Volume & Task Status row */}
          <div>
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Suspense fallback={<LoadingBox />}>
                  <LeadsBarChart data={chartData.monthlyTrend} />
                </Suspense>
              </div>
              <Suspense fallback={<LoadingBox />}>
                <TaskStatusChart data={chartData.taskStatus} />
              </Suspense>
            </div>
          </div>
        </>
      )}

      {/* ── Projects Module ── */}
      {projectsModule?.enabled && (
        <div>
          <SectionLabel label="Projects" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {/* <KpiCard
              href="/projects/tasks"
              title={dict("projects")}
              value={projects}
              sub="Active boards"
              IconComponent={Briefcase}
              accent="#09707e"
            /> */}
            <KpiCard
              href="/projects/tasks"
              title={dict("tasks")}
              value={tasks}
              sub="All tasks"
              IconComponent={ClipboardList}
              accent="#92bd42"
            />
            <KpiCard
              href={`/projects/tasks/${userId}`}
              title={dict("myTasks")}
              value={usersTasks}
              sub="Assigned to you"
              IconComponent={ClipboardList}
              accent="#f97316"
            />
          </div>
        </div>
      )}

      {/* ── Finance & Documents ── */}
      {/* {(invoiceModule?.enabled || documentsModule?.enabled) && (
        <div>
          <SectionLabel label="Finance & Documents" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {invoiceModule?.enabled && (
              <KpiCard
                href="/invoice"
                title={dict("invoices")}
                value={invoices}
                sub="Total invoices"
                IconComponent={Receipt}
                accent="#a855f7"
              />
            )}
            {documentsModule?.enabled && (
              <KpiCard
                href="/documents"
                title="Documents"
                value={documents}
                sub="Stored documents"
                IconComponent={FileText}
                accent="#0ea5e9"
              />
            )}
          </div>
        </div>
      )} */}

      {/* ── Storage ── */}
      {/* <div>
        <SectionLabel label={dict("storage")} />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <StorageQuota actual={storage} title={dict("storage")} />
        </div>
      </div> */}
    </div>
  );
};

export default DashboardPage;
