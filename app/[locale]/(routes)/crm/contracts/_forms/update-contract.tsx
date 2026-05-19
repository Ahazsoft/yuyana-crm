"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { crm_Accounts, crm_Contacts } from "@prisma/client";

import { useAction } from "@/hooks/use-action";
import { updateContract } from "@/actions/crm/contracts/update-contract";

import FormSheetNoTrigger from "@/components/sheets/form-sheet-no-trigger";
import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";
import { FormDatePicker } from "@/components/form/form-datepicker";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSelect } from "@/components/form/from-select";
import { UserSearchCombobox } from "@/components/ui/user-search-combobox";

const UpdateContractForm = ({
  onOpen,
  setOpen,
  accounts,
  contacts,
  data,
}: {
  onOpen: boolean;
  setOpen: (open: boolean) => void;
  accounts: crm_Accounts[];
  contacts: crm_Contacts[];
  data: any;
}) => {
  const router = useRouter();

  const [assignedTo, setAssignedTo] = useState<string>(data.assigned_to ?? "");

  // ✅ FIXED: correct contract type
  const contractType: "customer" | "company" =
    data.type === "customer" ? "customer" : "company";

  const contractStatuses = [
    { id: "NOTSTARTED", name: "Not started" },
    { id: "INPROGRESS", name: "In progress" },
    { id: "SIGNED", name: "Signed" },
  ];

  const { execute, fieldErrors, isLoading } = useAction(updateContract, {
    onSuccess: () => {
      toast.success("Contract updated successfully!");
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      console.log(fieldErrors);
      toast.error(error);
    },
  });

  const onAction = async (formData: FormData) => {
    const title = formData.get("title") as string;

    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    // const renewalReminderDate = new Date(
    //   formData.get("renewalReminderDate") as string,
    // );

    const description = formData.get("description") as string;
    const status = formData.get("status") as string;

    const account = formData.get("account") as string;
    const contact = formData.get("contact") as string;
    const assigned_to = formData.get("assigned_to") as string;

    const customerSignedDate =
      contractType === "customer"
        ? new Date(formData.get("customerSignedDate") as string)
        : undefined;

    const companySignedDate =
      contractType === "company"
        ? new Date(formData.get("companySignedDate") as string)
        : undefined;

    console.log("data", data.v);

    await execute({
      id: data.id,
      v: data.v,
      title,
      startDate,
      endDate,
      // renewalReminderDate,
      customerSignedDate,
      companySignedDate,
      description,
      status,
      account,
      contact,
      assigned_to,
    });
  };

  const contactOptions = contacts.map((contact) => ({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name}`,
  }));
  return (
    <FormSheetNoTrigger
      title="Update contract"
      description="Update contract details, dates, status, and assignments"
      open={onOpen}
      setOpen={setOpen}
    >
      <form action={onAction} className="space-y-4 w-[35vw]">
        {/* Title */}
        <FormInput
          id="title"
          label="Title"
          type="text"
          errors={fieldErrors}
          defaultValue={data.title}
        />

        {/* Dates */}
        <div className="flex gap-5">
          <FormDatePicker
            id="startDate"
            label="Start Date"
            type="hidden"
            errors={fieldErrors}
            defaultValue={data.startDate}
          />

          <FormDatePicker
            id="endDate"
            label="End Date"
            type="hidden"
            errors={fieldErrors}
            defaultValue={data.endDate}
          />
        </div>

        {/* Contract Type (locked) */}
        <div>
          <label className="text-sm font-medium">Contract Type</label>
          <div className="text-sm text-muted-foreground">
            {contractType === "customer" ? "Customer" : "Company"}
          </div>
        </div>

        {/* Renewal + Signed */}
        <div className="flex gap-5">
          {/* <FormDatePicker
            id="renewalReminderDate"
            label="Renewal Reminder Date"
            type="hidden"
            errors={fieldErrors}
            defaultValue={data.renewalReminderDate}
          /> */}

          {contractType === "customer" ? (
            <FormDatePicker
              id="customerSignedDate"
              label="Customer Signed Date"
              type="hidden"
              errors={fieldErrors}
              defaultValue={data.customerSignedDate}
            />
          ) : (
            <FormDatePicker
              id="companySignedDate"
              label="Company Signed Date"
              type="hidden"
              errors={fieldErrors}
              defaultValue={data.companySignedDate}
            />
          )}

          <div className="space-y-2 px-0">
            <label className="text-xs font-semibold">Assigned To</label>
            <UserSearchCombobox
              value={assignedTo}
              onChange={setAssignedTo}
              placeholder="Select assigned user"
              name="assigned_to"
            />
          </div>
        </div>

        {/* ✅ ENTITY SELECT (FIXED) */}
        {contractType === "company" && (
          <>
            <label className="text-sm font-medium">Company</label>
            <FormSelect
              id="account"
              type="hidden"
              data={accounts}
              errors={fieldErrors}
              defaultValue={data.account}
              placeholder="Select company"
            />
          </>
        )}

        {contractType === "customer" && (
          <>
            <label className="text-sm font-medium">Customer</label>
            <FormSelect
              id="contact"
              type="hidden"
              data={contactOptions}
              errors={fieldErrors}
              defaultValue={data.contact}
              placeholder="Select customer"
            />
          </>
        )}

        {/* Status */}
        <FormSelect
          id="status"
          label="Status"
          type="hidden"
          data={contractStatuses}
          errors={fieldErrors}
          defaultValue={data.status}
        />

        {/* Assigned */}
        <div className="space-y-2">
          <label className="text-xs font-semibold">Assigned To</label>
          <UserSearchCombobox
            value={assignedTo}
            onChange={setAssignedTo}
            placeholder="Select assigned user"
            name="assigned_to"
          />
        </div>

        {/* Description */}
        <FormTextarea
          id="description"
          label="Description"
          errors={fieldErrors}
          defaultValue={data.description}
        />

        {/* Submit */}
        <FormSubmit className="w-full">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Update"}
        </FormSubmit>
      </form>
    </FormSheetNoTrigger>
  );
};

export default UpdateContractForm;
