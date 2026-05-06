import Container from "../components/ui/Container";
import { getTranslations } from "next-intl/server";
import EmailCreatorForm from "./components/EmailCreatorForm";

type Props = {};

const Employees = async (props: Props) => {
  const t = await getTranslations("EmployeesPage");
  
  return (
    <Container
      title="Employees"
      description="Manage your employees"
    >
      <div className="space-y-6">
        <div>Employees module content</div>
        
        {/* Email Creation Form Section */}
        <div className="max-w-md border p-4 rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Create Employee Work Email</h2>
          <EmailCreatorForm />
        </div>
      </div>
    </Container>
  );
};

export default Employees;
