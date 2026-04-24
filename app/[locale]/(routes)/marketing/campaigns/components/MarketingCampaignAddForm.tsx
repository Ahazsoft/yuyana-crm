// @ts-nocheck
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
  name: z.string().min(2, { message: "Campaign name must be at least 2 characters." }),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "INACTIVE"]),
  templateId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().optional()
  ),
  targetAudience: z.string().optional(),
  emailSubject: z.string().optional(),
  emailContent: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketingCampaignAddFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  templates?: any[];
}

export const MarketingCampaignAddForm = ({
  onCancel,
  onSuccess,
  templates,
}: MarketingCampaignAddFormProps) => {
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "DRAFT",
      startDate: undefined,
      endDate: undefined,
      budget: undefined,
      targetAudience: "",
      emailSubject: "",
      emailContent: null,
      templateId: "",
    },
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Fetch template data when a template is selected
  useEffect(() => {
    if (!selectedTemplateId) {
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
        if (!res.ok) return;

        const template = await res.json();
        if (cancelled) return;

        let parsedBody = template.body;
        if (typeof template.body === "string") {
          try {
            parsedBody = JSON.parse(template.body);
          } catch {
            parsedBody = null;
          }
        }

        form.setValue("emailSubject", template.subject || "");
        form.setValue("emailContent", parsedBody);
        form.setValue("templateId", template.id);
      } catch (err) {
        console.error("Failed to fetch template:", err);
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
      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to create campaign");
      // Refresh server data and notify parent
      router.refresh();
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
                <Textarea placeholder="Describe your campaign" rows={3} {...field} />
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
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
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
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                  {["DRAFT", "ACTIVE", "PAUSED", "INACTIVE"].map((status) => (
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

        {/* Template Selection
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
              <FormDescription>Choose a template to prefill subject and body.</FormDescription>
              {templateLoading && (
                <p className="text-sm text-muted-foreground">Loading template...</p>
              )}
            </FormItem>
          )}
        /> */}

        {/* Email Subject
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
        /> */}

        {/* Email Content
        <FormField
          control={form.control}
          name="emailContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content</FormLabel>
              <FormControl>
                <TiptapEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>This will be the content of the email sent to your audience.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? "Saving..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
};