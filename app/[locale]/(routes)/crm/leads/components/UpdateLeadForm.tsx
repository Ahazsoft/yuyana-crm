"use client";

import { useState, useEffect } from "react";
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

import fetcher from "@/lib/fetcher";
import useSWR from "swr";
import SuspenseLoading from "@/components/loadings/suspense";
import { UserSearchCombobox } from "@/components/ui/user-search-combobox";

//TODO: fix all the types
type NewTaskFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
};

export function UpdateLeadForm({ initialData, setOpen }: NewTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("CrmLeadForm");
  const c = useTranslations("Common");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: accounts, isLoading: isLoadingAccounts } = useSWR(
    "/api/crm/account",
    fetcher,
  );

  const { data: campaigns, isLoading: isLoadingCampaigns } = useSWR(
    "/api/marketing/campaigns",
    fetcher,
  );

  // Determine initial service state
  const initialServiceValue = initialData?.service;
  const initialLeadSource = initialData?.lead_source;

  const isPredefinedService =
    initialServiceValue === "OUTBOUND" || initialServiceValue === "INBOUND";
  const isPredefinedLeadSource =
    initialLeadSource &&
    [
      "SOCIAL_MEDIA",
      "COLD_CALL",
      "WORD_OF_MOUTH",
      "WEBSITE",
      "EMAIL",
      "CAMPAIGN",
      "EXISTING_CUSTOMER",
      "SELF_GENERATED",
      "EMPLOYEE",
      "PARTNER",
      "PUBLIC_RELATIONS",
      "CONFERENCE",
      "OTHER",
    ].includes(initialLeadSource);

  const [serviceType, setServiceType] = useState<string>(
    isPredefinedService
      ? initialServiceValue
      : initialServiceValue
      ? "OTHER"
      : "",
  );
  const [leadSourceType, setLeadSourceType] = useState<string>(
    isPredefinedLeadSource
      ? initialLeadSource
      : initialLeadSource
      ? "OTHER"
      : "",
  );

  const [customService, setCustomService] = useState<string>(
    !isPredefinedService && initialServiceValue ? initialServiceValue : "",
  );
  const [customLeadSource, setCustomLeadSource] = useState<string>(
    !isPredefinedLeadSource && initialLeadSource ? initialLeadSource : "",
  );

  const formSchema = z.object({
    id: z.string().min(5),
    lastName: z.string().optional().nullable(),
    firstName: z.string().min(3).max(30),
    company: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(0).max(15).nullable().optional(),
    description: z.string().nullable().optional(),
    lead_source: z.string().nullable().optional(),
    refered_by: z.string().optional().nullable(),
    campaign: z.string().optional().nullable(),
    assigned_to: z.string().optional(),
    status: z.string(),
    service: z.string().optional(),
    followup_date: z.string().optional().nullable(),
  });

  type NewLeadFormValues = z.infer<typeof formSchema>;

  // Build default values – force service to "OTHER" if custom
  const defaultValues = {
    ...initialData,
    service: serviceType, // will be "OTHER" if custom
    lead_source: initialLeadSource
      ? isPredefinedLeadSource
        ? initialLeadSource
        : "OTHER"
      : undefined,
    followup_date: initialData?.followup_date
      ? typeof initialData.followup_date === "string"
        ? initialData.followup_date
        : new Date(initialData.followup_date).toISOString()
      : null,
  };

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: NewLeadFormValues) => {
    // If "Others" is selected, use the custom text
    if (serviceType === "OTHER") {
      if (!customService.trim()) {
        toast({
          variant: "destructive",
          title: c("error"),
          description: "Please enter a custom service name.",
        });
        return;
      }
      data.service = customService.trim();
    }
    if (leadSourceType === "OTHER") {
      if (!customLeadSource.trim()) {
        toast({
          variant: "destructive",
          title: c("error"),
          description: "Please enter a custom lead source.",
        });
        return;
      }
      data.lead_source = customLeadSource.trim();
    }

    setIsLoading(true);
    try {
      await axios.put("/api/crm/leads", data);
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

  const leadStatus = [
    { name: "New", id: "NEW" },
    { name: "Contacted", id: "CONTACTED" },
    { name: "Qualified", id: "QUALIFIED" },
    { name: "Lost", id: "LOST" },
  ];

  const leadSource = [
    { name: "Social Media", id: "SOCIAL_MEDIA" },
    { name: "Cold Call", id: "COLD_CALL" },
    { name: "Word of mouth", id: "WORD_OF_MOUTH" },
    { name: "Website", id: "WEBSITE" },
    { name: "Email", id: "EMAIL" },
    { name: "Campaign", id: "CAMPAIGN" },
    { name: "Existing Customer", id: "EXISTING_CUSTOMER" },
    { name: "Self Generated", id: "SELF_GENERATED" },
    { name: "Employee", id: "EMPLOYEE" },
    { name: "Partner", id: "PARTNER" },
    { name: "Public Relations", id: "PUBLIC_RELATIONS" },
    { name: "Conference", id: "CONFERENCE" },
    { name: "Other", id: "OTHER" },
  ];

  const leadService = [
    { name: "Out-Bound", id: "OUTBOUND" },
    { name: "In-Bound", id: "INBOUND" },
    { name: "Others", id: "OTHER" },
  ];

  if (isLoadingAccounts || isLoadingCampaigns)
    return (
      <div>
        <SuspenseLoading />
      </div>
    );

  if (!initialData) return <div>{c("somethingWentWrong")}</div>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full px-4 md:px-10"
      >
        <div className="w-full text-sm">
          <div className="pb-5 space-y-4">
            {/* first & last name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Johny"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Walker"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* company & lead source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("company")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter Company Name."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="lead_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadSource.map((src) => (
                          <SelectItem key={src.id} value={src.id}>
                            {src.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="lead_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead source</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setLeadSourceType(val);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadSource.map((src) => (
                          <SelectItem key={src.id} value={src.id}>
                            {src.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {leadSourceType === "OTHER" && (
                      <div className="mt-2">
                        <Input
                          disabled={isLoading}
                          value={customLeadSource}
                          onChange={(e) => setCustomLeadSource(e.target.value)}
                          placeholder="Enter custom lead source"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* email & phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="johny@domain.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="+11 123 456 789"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* referred by & campaign */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="refered_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("referredBy")}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Johny Walker"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadStatus.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* assigned to & status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="campaign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaign")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                      disabled={isLoading || isLoadingCampaigns}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a campaign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns?.map((campaign: any) => (
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

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Sales Person</FormLabel>
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

            {/* followup date & service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="followup_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Follow‑up Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isLoading}
                            className={cn(
                              "justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString() : null);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Service</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        setServiceType(val);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadService.map((src) => (
                          <SelectItem key={src.id} value={src.id}>
                            {src.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {serviceType === "OTHER" && (
                      <div className="mt-2">
                        <Input
                          disabled={isLoading}
                          value={customService}
                          onChange={(e) => setCustomService(e.target.value)}
                          placeholder="Enter custom service"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{c("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Enter Some Description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2 py-5">
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <span className="flex items-center animate-pulse">
                {c("savingData")}
              </span>
            ) : (
              t("updateButton")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
