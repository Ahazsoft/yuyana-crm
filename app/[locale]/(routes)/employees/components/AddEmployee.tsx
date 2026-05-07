// components/employees/AddEmployee.tsx
//@ts-nocheck
"use client";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ElementRef, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import axios from "axios";

import FormSheet from "@/components/sheets/form-sheet";
import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";
import { FormSelect } from "@/components/form/from-select";

import { EmployeeSchema, type UserRole } from "../table-data/schema";

const roleOptions = [
  { id: "ADMIN", name: "Admin" },
  { id: "SALES", name: "Sales" },
  { id: "MARKETING", name: "Marketing" },
];

const DOMAIN = "contacts.travelwithyuyana.com";

const AddEmployee = () => {
  const router = useRouter();
  const closeRef = useRef<ElementRef<"button">>(null);

  const t = useTranslations("EmployeeForm");
  const c = useTranslations("Common");

  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);

  const sanitizedUsername = useMemo(() => {
    return username
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_]/g, "");
  }, [username]);

  const derivedEmail = sanitizedUsername
    ? `${sanitizedUsername}@${DOMAIN}`
    : "";

  const onSubmit = async (formData: FormData) => {
    try {
      setIsPending(true);

      const name = formData.get("name") as string;
      const phone = (formData.get("phone") as string) || null;
      const role = formData.get("role") as UserRole;
      const personalEmail = (formData.get("personalEmail") as string) || null;

      const payload = {
        name,
        username: sanitizedUsername,
        email: derivedEmail,
        phone,
        role,
        personalEmail,
      };

      const validation = EmployeeSchema.safeParse(payload);

      if (!validation.success) {
        toast.error(
          validation.error.errors[0]?.message || "Validation failed"
        );
        return;
      }

      const response = await axios.post("/api/employee", validation.data);

      if (response.status === 201) {
        toast.success("Employee created – credentials sent to personal email");
        closeRef.current?.click();
        router.refresh();
      } else {
        toast.error(response.data?.error || "Failed to create employee");
      }
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.error || "Something went wrong";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <FormSheet
      trigger="Add Employee"
      title="Add Employees"
      description="Create a new employee. Login credentials will be sent to the provided personal email."
      onClose={closeRef}
    >
      <form action={onSubmit} className="space-y-5">
        {/* Full Name */}
        <FormInput
          id="name"
          label="Full Name"
          type="text"
          placeholder="e.g. John Doe"
          required
        />

        {/* Username + Email Domain */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-700">
            Username
          </label>

          <div className="flex overflow-hidden rounded-md border bg-background">
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />

            <div className="border-l bg-muted px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
              @{DOMAIN}
            </div>
          </div>

          <input type="hidden" name="email" value={derivedEmail} />
        </div>

        {/* Personal Email (for receiving credentials) */}
        <FormInput
          id="personalEmail"
          label="Personal Email"
          type="email"
          placeholder="employee@gmail.com"
          required
        />

        {/* Role */}
        <FormSelect
          id="role"
          label="Role"
          type="hidden"
          data={roleOptions}
          placeholder="Select role"
          required
        />

        {/* Phone */}
        <FormInput
          id="phone"
          label="Phone Number"
          type="tel"
          placeholder="+1234567890"
        />

        {/* Submit */}
        <FormSubmit className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            c("create")
          )}
        </FormSubmit>
      </form>
    </FormSheet>
  );
};

export default AddEmployee;