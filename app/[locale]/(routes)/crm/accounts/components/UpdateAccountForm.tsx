"use client";

import React from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserSearchCombobox } from "@/components/ui/user-search-combobox";

interface UpdateAccountFormProps {
  initialData: any;
  open: (value: boolean) => void;
}

export function UpdateAccountForm({
  initialData,
  open,
}: UpdateAccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const t = useTranslations("CrmAccountForm");
  const c = useTranslations("Common");

  const formSchema = z.object({
    id: z.string().min(1, "ID is required"),
    name: z.string().min(3).max(80),
    office_phone: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    fax: z.string().nullable().optional(),
    company_id: z.string().nullable().optional(),
    vat: z.string().nullable().optional(),
    email: z.string().email("Invalid email"),
    billing_street: z.string().nullable().optional(),
    billing_postal_code: z.string().nullable().optional(),
    billing_city: z.string().nullable().optional(),
    billing_state: z.string().nullable().optional(),
    billing_country: z.string().nullable().optional(),
    shipping_street: z.string().nullable().optional(),
    shipping_postal_code: z.string().nullable().optional(),
    shipping_city: z.string().nullable().optional(),
    shipping_state: z.string().nullable().optional(),
    shipping_country: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    assigned_to: z.string().min(1, "Assigned user is required"),
    status: z.string().nullable().optional(),
    annual_revenue: z.string().nullable().optional(),
    member_of: z.string().nullable().optional(),
    employees: z.string().nullable().optional(),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          office_phone: initialData.office_phone ?? "",
          website: initialData.website ?? "",
          fax: initialData.fax ?? "",
          company_id: initialData.company_id ?? "",
          vat: initialData.vat ?? "",
          billing_street: initialData.billing_street ?? "",
          billing_postal_code: initialData.billing_postal_code ?? "",
          billing_city: initialData.billing_city ?? "",
          billing_state: initialData.billing_state ?? "",
          billing_country: initialData.billing_country ?? "",
          shipping_street: initialData.shipping_street ?? "",
          shipping_postal_code: initialData.shipping_postal_code ?? "",
          shipping_city: initialData.shipping_city ?? "",
          shipping_state: initialData.shipping_state ?? "",
          shipping_country: initialData.shipping_country ?? "",
          description: initialData.description ?? "",
          status: initialData.status ?? "",
          annual_revenue: initialData.annual_revenue ?? "",
          member_of: initialData.member_of ?? "",
          employees: initialData.employees ?? "",
        }
      : {
          id: "",
          name: "",
          email: "",
          assigned_to: "",
          office_phone: "",
          website: "",
          fax: "",
          company_id: "",
          vat: "",
          billing_street: "",
          billing_postal_code: "",
          billing_city: "",
          billing_state: "",
          billing_country: "",
          shipping_street: "",
          shipping_postal_code: "",
          shipping_city: "",
          shipping_state: "",
          shipping_country: "",
          description: "",
          status: "",
          annual_revenue: "",
          member_of: "",
          employees: "",
        },
  });

  const onSubmit = async (data: NewAccountFormValues) => {
    console.log("Submitting data:", data); // Debug
    setIsLoading(true);
    try {
      await axios.put(`/api/crm/account/edit/${data.id}`, data);
      toast({
        title: c("success"),
        description: t("updateSuccess"),
      });
      open(false);
      router.refresh();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: c("error"),
        description: error?.response?.data || c("somethingWentWrong"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: Show form errors
  console.log("Form errors:", form.formState.errors);

  if (!initialData) return <div>{c("somethingWentWrong")}</div>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full h-full px-4 md:px-10"
      >
        {/* Temporary debug block – remove after fixing
        <div className="bg-red-100 p-2 text-xs">
          <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
        </div> */}

        <div className="w-full text-sm">
          <div className="pb-5 space-y-2">
            <div className="grid grid-cols-2 gap-4 pb-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter Company Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="account@domain.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pb-5">
              <FormField
                control={form.control}
                name="office_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("officePhone")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="+251 ...."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("website")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="https://www.domain.com"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{c("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 pb-5">
              {/* Employees Dropdown */}
              <FormField
                control={form.control}
                name="employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-500">51-500 employees</SelectItem>
                        <SelectItem value="501+">501+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{c("assignedTo")}</FormLabel>
                    <FormControl>
                      <UserSearchCombobox
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={c("selectUser")}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-2 py-5">
          <Button disabled={isLoading} type="submit">
            {isLoading ? c("savingData") : t("updateButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}