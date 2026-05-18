import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import {
  CoinsIcon,
  Contact,
  DollarSignIcon,
  FactoryIcon,
  FilePenLine,
  HeartHandshakeIcon,
  LandmarkIcon,
  Lock,
  ShieldX,
  UserIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";

import Container from "./components/ui/Container";
import LoadingBox from "./components/dasboard/loading-box";
import StorageQuota from "./components/dasboard/storage-quota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  getTasksCount,
  getUsersTasksCount,
} from "@/actions/dashboard/get-tasks-count";
import { getModules } from "@/actions/get-modules";
import { getEmployees } from "@/actions/get-empoloyees";
import { getLeadsCount } from "@/actions/dashboard/get-leads-count";
import { getBoardsCount } from "@/actions/dashboard/get-boards-count";
import { getStorageSize } from "@/actions/documents/get-storage-size";
import { getContactCount } from "@/actions/dashboard/get-contacts-count";
import { getAccountsCount } from "@/actions/dashboard/get-accounts-count";
import { getContractsCount } from "@/actions/dashboard/get-contracts-count";
import { getInvoicesCount } from "@/actions/dashboard/get-invoices-count";
import { getDocumentsCount } from "@/actions/dashboard/get-documents-count";
import { getActiveUsersCount } from "@/actions/dashboard/get-active-users-count";
import { getOpportunitiesCount } from "@/actions/dashboard/get-opportunities-count";
import { getExpectedRevenue } from "@/actions/crm/opportunity/get-expected-revenue";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const userId = session?.user?.id;

  //Get user language
  const lang = session?.user?.userLanguage;

  //Fetch translations from dictionary
  const dict = await getTranslations("DashboardPage");
  const modules = await getModules();
  const leads = await getLeadsCount();
  const tasks = await getTasksCount();
  const employees = await getEmployees();
  const storage = await getStorageSize();
  const projects = await getBoardsCount();
  const contacts = await getContactCount();
  const contracts = await getContractsCount();
  const users = await getActiveUsersCount();
  const accounts = await getAccountsCount();
  const invoices = await getInvoicesCount();
  const revenue = await getExpectedRevenue();
  const documents = await getDocumentsCount();
  const opportunities = await getOpportunitiesCount();
  const usersTasks = await getUsersTasksCount(userId);

  //Find which modules are enabled
  const crmModule = modules.find((module) => module.name === "crm");
  const invoiceModule = modules.find((module) => module.name === "invoice");
  const projectsModule = modules.find((module) => module.name === "projects");
  const documentsModule = modules.find((module) => module.name === "documents");
  const employeesModule = modules.find((module) => module.name === "employees");

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";
  console.log(isAdmin);

  if (!isAdmin) {
    return (
      <div className="mx-5">
        <Container
          title={dict("containerTitle")}
          description={
            "Welcome to Yuyana CRM cockpit, here you can see your company overview"
          }
        >
          <div className="flex flex-col items-center justify-center py-12 px-6">
            {/* Icon Container */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-full ring-1 ring-red-200 dark:ring-red-800">
                <ShieldX
                  className="w-16 h-16 text-red-500 dark:text-red-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-3 max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Hello {session.user.name}
              </h2>

              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <p className="text-lg">
                  You're not allowed to access this page.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This page is only available for administrators.
              </p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <Container
      title={dict("containerTitle")}
      description={
        "Welcome to Yuyana CRM cockpit, here you can see your company overview"
      }
    >
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<LoadingBox />}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dict("totalRevenue")}
              </CardTitle>
              <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">{"0"}</div>
            </CardContent>
          </Card>
        </Suspense>
        <Suspense fallback={<LoadingBox />}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dict("expectedRevenue")}
              </CardTitle>
              <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">
                {
                  //I need revenue value in format 1.000.000
                  typeof revenue === "number"
                    ? revenue.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })
                    : "$0.00"
                }
              </div>
            </CardContent>
          </Card>
        </Suspense>

        <DashboardCard
          href="/admin/users"
          title={dict("activeUsers")}
          IconComponent={UserIcon}
          content={users}
        />
        {
          //show crm module only if enabled is true
          employeesModule?.enabled && (
            <DashboardCard
              href="/employees"
              title="Employees"
              IconComponent={Users2Icon}
              content={employees.length}
            />
          )
        }
        {
          //show crm module only if enabled is true
          crmModule?.enabled && (
            <>
              <DashboardCard
                href="/crm/accounts"
                title={dict("accounts")}
                IconComponent={LandmarkIcon}
                content={accounts}
              />
              <DashboardCard
                href="/crm/opportunities"
                title={dict("opportunities")}
                IconComponent={HeartHandshakeIcon}
                content={opportunities}
              />
              <DashboardCard
                href="/crm/contacts"
                title={dict("contacts")}
                IconComponent={Contact}
                content={contacts}
              />
              <DashboardCard
                href="/crm/leads"
                title={dict("leads")}
                IconComponent={CoinsIcon}
                content={leads}
              />
              <DashboardCard
                href="/crm/contracts"
                title={dict("contracts")}
                IconComponent={FilePenLine}
                content={contracts}
              />
            </>
          )
        }
        {projectsModule?.enabled && (
          <>
            <DashboardCard
              href="/projects"
              title={dict("projects")}
              IconComponent={CoinsIcon}
              content={projects}
            />
            <DashboardCard
              href="/projects/tasks"
              title={dict("tasks")}
              IconComponent={CoinsIcon}
              content={tasks}
            />
            <DashboardCard
              href={`/projects/tasks/${userId}`}
              title={dict("myTasks")}
              IconComponent={CoinsIcon}
              content={usersTasks}
            />
          </>
        )}
        {invoiceModule?.enabled && (
          <DashboardCard
            href="/invoice"
            title={dict("invoices")}
            IconComponent={CoinsIcon}
            content={invoices}
          />
        )}

        <StorageQuota actual={storage} title={dict("storage")} />
      </div>
    </Container>
  );
};

export default DashboardPage;

const DashboardCard = ({
  href,
  title,
  IconComponent,
  content,
}: {
  href?: string;
  title: string;
  IconComponent: any;
  content: number;
}) => (
  <Link href={href || "#"}>
    <Suspense fallback={<LoadingBox />}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <IconComponent className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-medium">{content}</div>
        </CardContent>
      </Card>
    </Suspense>
  </Link>
);
