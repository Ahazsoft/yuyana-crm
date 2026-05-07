// components/employees/CreateEmployeeForm.tsx
//@ts-nocheck

"use client";

import { toast } from "sonner";
import { Loader2, Copy, Send, Check } from "lucide-react";
import { ElementRef, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import axios from "axios";

import FormSheet from "@/components/sheets/form-sheet";
import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";
import { FormSelect } from "@/components/form/from-select";

import { EmployeeSchema, type UserRole } from "../table-data/schema";
import { Button } from "@/components/ui/button";

const roleOptions = [
  { id: "ADMIN", name: "Admin" },
  { id: "SALES", name: "Sales" },
  { id: "MARKETING", name: "Marketing" },
];

const DOMAIN = "contacts.travelwithyuyana.com";

const CreateEmployeeForm = () => {
  const router = useRouter();
  const closeRef = useRef<ElementRef<"button">>(null);

  const t = useTranslations("EmployeeForm");
  const c = useTranslations("Common");

  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

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

      const validation = EmployeeSchema.safeParse({
        name,
        username: sanitizedUsername,
        email: derivedEmail,
        phone,
        role,
      });

      if (!validation.success) {
        toast.error(
          validation.error.errors[0]?.message || "Validation failed"
        );
        return;
      }

      const response = await axios.post("/api/employee", validation.data);

      if (response.status === 201) {
        // Save the plain password for one‑time display
        setCreatedPassword(response.data.password);
        toast.success("Employee created – password shown below");
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

  const handleCopy = async () => {
    if (!createdPassword) return;
    await navigator.clipboard.writeText(createdPassword);
    setCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToContact = async () => {
    if (!createdPassword || !derivedEmail) return;
    setSending(true);
    try {
      // ----- Placeholder: call an API to email the credentials -----
      await axios.post("/api/employee/send-credentials", {
        email: derivedEmail,
        password: createdPassword,
        name: derivedEmail.split("@")[0],
      });
      toast.success("Credentials sent to " + derivedEmail);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to send credentials"
      );
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    // Clear the password so it can't be seen again
    setCreatedPassword(null);
    closeRef.current?.click();
    router.refresh();
  };

  // Helper: if password is set, show the one‑time credentials view
  if (createdPassword) {
    return (
      <FormSheet
        trigger="Add Employee"
        title="Employee Created"
        description="Copy the password or send it to the new employee."
        onClose={closeRef}
      >
        <div className="space-y-4 py-4">
          <p className="text-sm font-medium">One‑time password</p>
          <div className="flex items-center gap-2 rounded border bg-muted p-3 font-mono text-lg">
            <span className="flex-1 select-all">{createdPassword}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded p-1 hover:bg-background"
              title="Copy password"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="default"
              disabled={sending}
              onClick={handleSendToContact}
              className="flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send to {derivedEmail}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </FormSheet>
    );
  }

  // Default create form (unchanged layout, only minor tweaks)
  return (
    <FormSheet
      trigger="Add Employee"
      title="Add Employees"
      description="Create a new employee. Email is auto-generated from the username."
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

export default CreateEmployeeForm;