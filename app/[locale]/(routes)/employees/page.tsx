//@ts-nocheck
import Container from "../components/ui/Container2";
import { getTranslations } from "next-intl/server";
import EmailCreatorForm from "./components/EmailCreatorForm";
import CreateEmployeeForm from "./components/AddEmployee";
import { getEmployees } from "@/actions/get-employees";
import EmployeesTable from "./components/EmployeesTable";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldX, Lock } from "lucide-react";
type Props = {};

const Employees = async (props: Props) => {
  const t = await getTranslations("EmployeesPage");
  const employees = await getEmployees();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    return (
      <Container
        title="Employees"
        description="Manage your employees"
        buttonComponent={<CreateEmployeeForm />}
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
              <p className="text-lg">You're not allowed to access this page.</p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              This page is only available for administrators.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container
      title="Employees"
      description="Manage your employees"
      buttonComponent={<CreateEmployeeForm />}
    >
      <div className="space-y-6">
        <div>
          <EmployeesTable data={employees} />
        </div>

        {/* Email Creation Form Section */}
        {/* <div className="max-w-md border p-4 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3">
            Create Employee Work Email
          </h2>
          <EmailCreatorForm />
        </div> */}
      </div>
    </Container>
  );
};

export default Employees;
