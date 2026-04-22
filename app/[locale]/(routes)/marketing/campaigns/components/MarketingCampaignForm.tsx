// @ts-nocheck
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TiptapEditor from "@/components/marketing/TipTapEditor";
import { TemplateSearchCombobox } from "@/components/ui/template-search-combobox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Campaign name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]),
  templateId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().optional(),
  ),
  targetAudience: z.string().optional(),
  emailSubject: z.string().optional(),
  emailContent: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketingCampaignFormProps {
  initialData?: FormValues & { id?: string };
  onCancel: () => void;
  onSuccess: () => void;
  templates?: any[];
}

export const MarketingCampaignForm = ({
  initialData,
  onCancel,
  onSuccess,
  templates,
}: MarketingCampaignFormProps) => {
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "DRAFT",
      // 🔧 Convert string dates to Date objects (fixes "expected date, received string")
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      budget: initialData?.budget || undefined,
      targetAudience: initialData?.targetAudience || "",
      emailSubject: initialData?.emailSubject || "",
      emailContent: initialData?.emailContent || null,
      templateId: (initialData as any)?.templateId || "",
    },
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    (initialData as any)?.templateId || "",
  );

  // Fetch template data when selectedTemplateId changes
  useEffect(() => {
    if (!selectedTemplateId) {
      // Clear fields when template is deselected
      form.setValue("emailSubject", "");
      form.setValue("emailContent", null);
      form.setValue("templateId", "");
      return;
    }

    let cancelled = false;
    const fetchTemplate = async () => {
      setTemplateLoading(true);
      try {
        const res = await fetch(`/api/marketing/templates/${selectedTemplateId}`);
        if (!res.ok) {
          console.error("Failed to fetch template:", res.status);
          return;
        }

        const template = await res.json();
        if (cancelled) return;

        // Parse body if it's stored as a string
        let parsedBody = template.body;
        if (typeof template.body === "string") {
          try {
            parsedBody = JSON.parse(template.body);
          } catch (e) {
            console.error("Failed to parse template body", e);
            parsedBody = null;
          }
        }

        form.setValue("emailSubject", template.subject || "");
        form.setValue("emailContent", parsedBody); // ✅ JSON object – no getPreviewText overwrite
        form.setValue("templateId", template.id);
      } catch (err) {
        console.error("❌ Failed to fetch template:", err);
      } finally {
        if (!cancelled) setTemplateLoading(false);
      }
    };

    fetchTemplate();
    return () => {
      cancelled = true;
    };
  }, [selectedTemplateId, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const url = initialData?.id
        ? `/api/marketing/campaigns/${initialData.id}`
        : "/api/marketing/campaigns";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${initialData?.id ? "update" : "create"} campaign`,
        );
      }

      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter campaign name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your campaign"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
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
                      disabled={(date) => date > new Date() && !initialData?.id}
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Budget */}
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <div className="flex space-x-4">
                  {["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2"
                        checked={field.value === status}
                        onChange={() => field.onChange(status)}
                      />
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Template Selection */}
        <FormField
          control={form.control}
          name="templateId"
          render={() => (
            <FormItem>
              <FormLabel>Use Template</FormLabel>
              <FormControl>
                <TemplateSearchCombobox
                  value={selectedTemplateId}
                  onChange={(id) => setSelectedTemplateId(id)}
                  initialTemplates={templates}
                />
              </FormControl>
              <FormDescription>
                Choose a template to prefill subject and body.
              </FormDescription>
              {templateLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading template...
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Email Subject */}
        <FormField
          control={form.control}
          name="emailSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter email subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Content */}
        <FormField
          control={form.control}
          name="emailContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content</FormLabel>
              <FormControl>
                <TiptapEditor
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              </FormControl>
              <FormDescription>
                This will be the content of the email sent to your audience.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : initialData?.id
                ? "Update Campaign"
                : "Create Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
};