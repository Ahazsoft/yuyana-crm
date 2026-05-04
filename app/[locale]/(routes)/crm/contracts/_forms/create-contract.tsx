"use client";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ElementRef, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { crm_Accounts, crm_Contacts } from "@prisma/client";
import { UserSearchCombobox } from "@/components/ui/user-search-combobox";

import { useAction } from "@/hooks/use-action";
import { createNewContract } from "@/actions/crm/contracts/create-new-contract";

import { FormInput } from "@/components/form/form-input";
import FormSheet from "@/components/sheets/form-sheet";
import { FormSubmit } from "@/components/form/form-submit";
import { FormDatePicker } from "@/components/form/form-datepicker";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSelect } from "@/components/form/from-select";

const CreateContractForm = ({
  accounts,
  accountId,
  contacts
}: {
  accounts: crm_Accounts[];
  accountId: string;
  contacts:crm_Contacts[];
}) => {
  const router = useRouter();
  const closeRef = useRef<ElementRef<"button">>(null);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [contractType, setContractType] = useState<"customer" | "company">(
    "customer",
  );
  const t = useTranslations("CrmContractForm");
  const c = useTranslations("Common");

  const { execute, fieldErrors, isLoading } = useAction(createNewContract, {
    onSuccess: (data) => {
      toast.success(t("createSuccess"));
      closeRef.current?.click();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onAction = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const renewalReminderDate = new Date(
      formData.get("renewalReminderDate") as string,
    );
    const description = formData.get("description") as string;
    const account = formData.get("account") as string;
    const assigned_to = formData.get("assigned_to") as string;

    // Only pick the date from the visible radio‑selected field
    const customerSignedDate =
      contractType === "customer"
        ? new Date(formData.get("customerSignedDate") as string)
        : undefined;
    const companySignedDate =
      contractType === "company"
        ? new Date(formData.get("companySignedDate") as string)
        : undefined;

    await execute({
      title,
      startDate,
      endDate,
      renewalReminderDate,
      customerSignedDate,
      companySignedDate,
      description,
      account,
      assigned_to,
    });
  };

  return (
    <FormSheet
      trigger={"New"}
      title={t("createButton")}
      description="Create a new contract with specified terms, dates, and assigned users"
      onClose={closeRef}
    >
      <form
        action={onAction}
        className="space-y-4 flex-col justify-between items-center"
      >
        <div className="space-y-1 flex flex-row justify-around">
          <FormInput
            className="w-[35vw]"
            id="title"
            label="Contract Title"
            type="text"
            errors={fieldErrors}
            placeholder="Enter Contract title"
          />
        </div>

        <div className="space-y-2 flex flex-row justify-around">
          <FormDatePicker
            id="startDate"
            label="Start Date"
            type="hidden"
            errors={fieldErrors}
          />
          <FormDatePicker
            id="endDate"
            label="End Date"
            type="hidden"
            errors={fieldErrors}
          />
        </div>
        {/* ── Radio group: Customer / Company ── */}
        <div className="space-y-2 px-4">
          <label className="text-sm font-medium">Contract Type</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contractType"
                value="customer"
                checked={contractType === "customer"}
                onChange={() => setContractType("customer")}
              />
              Customer
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contractType"
                value="company"
                checked={contractType === "company"}
                onChange={() => setContractType("company")}
              />
              Company
            </label>
          </div>
        </div>

        <div className="space-y-2 flex flex-row justify-around">
          <FormDatePicker
            id="renewalReminderDate"
            label="Renewal Reminder Date"
            type="hidden"
            errors={fieldErrors}
          />

          {/* Conditionally show the appropriate signed date */}
          {contractType === "customer" ? (
            <FormDatePicker
              id="customerSignedDate"
              label="Customer Signed Date"
              type="hidden"
              errors={fieldErrors}
            />
          ) : (
            <FormDatePicker
              id="companySignedDate"
              label="Company Signed Date"
              type="hidden"
              errors={fieldErrors}
            />
          )}
        </div>

        <FormSelect
          id="account"
          label="Company"
          type="hidden"
          data={accounts}
          errors={fieldErrors}
          defaultValue={accountId || undefined}
          placeholder="select Company"
        />
        <>
        <label className="text-sm font-medium">{c("assignedTo")}</label>
        <UserSearchCombobox
          value={assignedTo}
          onChange={setAssignedTo}
          placeholder={c("selectUser")}
          disabled={isLoading}
          name="assigned_to"
        />
        </>
        <div className="space-y-2 flex flex-row justify-between">
          <FormTextarea
            id="description"
            label="description"
            errors={fieldErrors}
            placeholder="Description"
          />
        </div>

        <div className="space-y-2 flex flex-row justify-between"></div>
        <FormSubmit className="w-full">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            c("create")
          )}
        </FormSubmit>
      </form>
    </FormSheet>
  );
};

export default CreateContractForm;
