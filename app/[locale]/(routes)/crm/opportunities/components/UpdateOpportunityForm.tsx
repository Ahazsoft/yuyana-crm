"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import SuspenseLoading from "@/components/loadings/suspense";
import fetcher from "@/lib/fetcher";
import useSWR from "swr";

type NewTaskFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
};

export function UpdateOpportunityForm({
  initialData,
  setOpen,
}: NewTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("CrmOpportunityForm");
  const c = useTranslations("Common");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: opportunities, isLoading: isLoadingOpportunities } = useSWR(
    "/api/crm/opportunity",
    fetcher, // fetcher simply returns res.json() – see below
  );

  // ----- 1. SCHEMA (unchanged) -----
  const formSchema = z.object({
    id: z.string().min(5),
    name: z.string(),
    close_date: z.date({
      message: "An expected close date is required.",
    }),
    description: z.string(),
    type: z.string(),
    sales_stage: z.string(),
    budget: z.string(),
    currency: z.string(),
    expected_revenue: z.string(),
    next_step: z.string(),
    assigned_to: z.string(),
    account: z.string(),
    contact: z.string(),
    campaign: z.string().nullable().optional(),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  // ----- 2. FLATTEN INITIAL DATA (the fix!) -----
  // We extract just the ID from any relationship that might be an object.
  const flattenRelation = (val: any) => {
    if (typeof val === "object" && val !== null && "id" in val) return val.id;
    if (typeof val === "string") return val;
    return ""; // fallback empty string
  };

  const defaultFormValues = {
    id: initialData.id ?? "",
    name: initialData.name ?? "",
    description: initialData.description ?? "",
    type: flattenRelation(initialData.type),
    sales_stage: flattenRelation(initialData.sales_stage),
    budget: String(initialData.budget ?? ""),
    currency: initialData.currency ?? "",
    expected_revenue: String(initialData.expected_revenue ?? ""),
    next_step: initialData.next_step ?? "",
    assigned_to: flattenRelation(initialData.assigned_to),
    account: flattenRelation(initialData.account),
    contact: flattenRelation(initialData.contact),
    campaign: flattenRelation(initialData.campaign) || null,
    close_date: initialData.close_date
      ? new Date(initialData.close_date)
      : undefined,
  };

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  // ----- 3. SUBMIT (unchanged) -----
  const onSubmit = async (data: NewAccountFormValues) => {
    setIsLoading(true);
    try {
      await axios.put("/api/crm/opportunity", data);
      toast({
        title: c("success"),
        description: t("updateSuccess"),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: c("error"),
        description: error?.response?.data,
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
      router.refresh();
    }
  };

  if (isLoading || isLoadingOpportunities)
    return (
      <div>
        <SuspenseLoading />
      </div>
    );

  const { users, accounts, contacts, saleTypes, saleStages, campaigns } =
    opportunities || {};

  if (!users || !accounts || !initialData) {
    console.warn("Missing data:", { users, accounts, initialData });
    return <div>{c("somethingWentWrong")}</div>;
  }

  // Optional debug: confirm flattened values are strings
  console.log("Flattened default values:", defaultFormValues);

  // ----- 4. RENDER (Selects use value={field.value}) -----
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full px-4 md:px-10"
      >
        {/* Show validation errors for debugging (remove later) */}
        {/* <div>
          <pre>
            <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
          </pre>
        </div> */}

        <div className="w-full text-sm">
          <div className="pb-5 space-y-2">
            {/* Name & Close Date*/}

            <div className="grid grid-cols-2 gap-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="New NextCRM functionality"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Close Date */}
              <FormField
                control={form.control}
                name="close_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("closeDate")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t("closeDatePlaceholder")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{c("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="New NextCRM functionality"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-2">
                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("salesType")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("salesTypePlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="flex overflow-y-auto h-56">
                          {saleTypes.map((type: any) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sales Stage */}
                <FormField
                  control={form.control}
                  name="sales_stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("saleStage")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("saleStagePlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="flex overflow-y-auto h-56">
                          {saleStages.map((stage: any) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("budget")}</FormLabel>
                      <FormControl>
                        <Input
                          type={"number"}
                          disabled={isLoading}
                          placeholder="1000000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Currency */}
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("currency")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="USD"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expected Revenue */}
                <FormField
                  control={form.control}
                  name="expected_revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("expectedRevenue")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isLoading}
                          placeholder="500000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Next Step */}
                <FormField
                  control={form.control}
                  name="next_step"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("nextStep")}</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          placeholder={t("nextStepPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right column */}
              <div className="space-y-2">
                {/* Assigned To */}
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{c("assignedTo")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user to assign the account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="overflow-y-auto h-56">
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account */}
                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("assignedAccount")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose account " />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="flex overflow-y-auto h-56">
                          {accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact */}
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Contact</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a contact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="flex overflow-y-auto h-56">
                          {contacts.map((contact: any) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.first_name + " " + contact.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campaign */}
                <FormField
                  control={form.control}
                  name="campaign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From campaign</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a campaign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="flex overflow-y-auto h-56">
                          {campaigns.map((campaign: any) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 py-5">
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <span className="flex items-center animate-pulse">
                {c("savingData")}
              </span>
            ) : (
              c("update")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
