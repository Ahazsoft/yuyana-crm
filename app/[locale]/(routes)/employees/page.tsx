//@ts-nocheck
import Container from "../components/ui/Container2";
import { getTranslations } from "next-intl/server";
import EmailCreatorForm from "./components/EmailCreatorForm";
import CreateEmployeeForm from "./components/AddEmployee";
import { getEmployees } from "@/actions/get-empoloyees";
import EmployeesTable from "./components/EmployeesTable";

type Props = {};

const Employees = async (props: Props) => {
  const t = await getTranslations("EmployeesPage");
  const employees = await getEmployees();

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
