"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/marketing/TipTapEditor";
import { ChevronRight, Copy } from "lucide-react";

// This represents your imported JSON
const CRM_SCHEMA = {
  crm_Accounts: {
    label: "Company",
    attributes: {
      name: { label: "Company Name", type: "String" },
      status: { label: "Company Status", type: "String" },
      email: { label: "Company Email", type: "String" },
      office_phone: { label: "Office Phone", type: "String" },
      website: { label: "Website", type: "String" },
      assigned_to: { label: "Assigned User", type: "Uuid" },
      createdAt: { label: "Created Date", type: "DateTime" },
    },
  },
  crm_Leads: {
    label: "Leads",
    attributes: {
      firstName: { label: "First Name", type: "String" },
      lastName: { label: "Last Name", type: "String" },
      company: { label: "Company Name", type: "String" },
      jobTitle: { label: "Job Title", type: "String" },
      email: { label: "Email Address", type: "String" },
      phone: { label: "Phone Number", type: "String" },
      status: { label: "Lead Status", type: "String" },
      type: { label: "Lead Type", type: "String" },
      lead_source: { label: "Lead Source", type: "String" },
      campaign: { label: "Campaign", type: "String" },
      assigned_to: { label: "Assigned User", type: "Uuid" },
      description: { label: "Description", type: "String" },
    },
  },
  crm_Opportunities: {
    label: "Opportunities",
    attributes: {
      name: { label: "Opportunity Name", type: "String" },
      budget: { label: "Budget", type: "BigInt" },
      expected_revenue: { label: "Expected Revenue", type: "BigInt" },
      status: { label: "Opportunity Status", type: "Enum" },
      close_date: { label: "Close Date", type: "DateTime" },
      next_step: { label: "Next Step", type: "String" },
      account: { label: "Company Name", type: "Uuid" },
      assigned_to: { label: "Assigned User", type: "Uuid" },
    },
  },
  crm_Contacts: {
    label: "Contacts",
    attributes: {
      first_name: { label: "First Name", type: "String" },
      last_name: { label: "Last Name", type: "String" },
      position: { label: "Job Position", type: "String" },
      email: { label: "Work Email", type: "String" },
      personal_email: { label: "Personal Email", type: "String" },
      mobile_phone: { label: "Mobile Phone", type: "String" },
      birthday: { label: "Birthday", type: "String" },
      status: { label: "Is Active", type: "Boolean" },
      social_linkedin: { label: "LinkedIn Profile", type: "String" },
      social_twitter: { label: "Twitter Profile", type: "String" },
      tags: { label: "Tags", type: "StringArray" },
    },
  },
};

export default function TemplateForm({ initial = {} }: { initial?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title || "");
  const [subtitle, setSubtitle] = useState(initial.subtitle || "");
  const [subject, setSubject] = useState(initial.subject || "");
  const [body, setBody] = useState(initial.body || null);
  const [loading, setLoading] = useState(false);

  // Selector State
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedAttr, setSelectedAttr] = useState("");

  // Get attributes for the selected table
  const availableAttrs = useMemo(() => {
    if (!selectedTable) return {};
    return (CRM_SCHEMA as any)[selectedTable].attributes;
  }, [selectedTable]);

  // Construct the merge tag string
  const mergeTag = selectedTable && selectedAttr ? `{{${selectedTable}.${selectedAttr}}}` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, subject, body }),
      });
      if (res.ok) {
        router.push("/marketing/templates");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
      {/* Field Helper Tool */}
      <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-primary/20 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
          <Copy size={16} /> Dynamic Field Helper
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* 1st Dropdown: Table Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Select Module</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setSelectedAttr(""); // Reset attribute when table changes
              }}
            >
              <option value="">Choose Module...</option>
              {Object.entries(CRM_SCHEMA).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2nd Dropdown: Attribute */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Select Field</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary disabled:opacity-50"
              disabled={!selectedTable}
              value={selectedAttr}
              onChange={(e) => setSelectedAttr(e.target.value)}
            >
              <option value="">Choose Field...</option>
              {Object.entries(availableAttrs).map(([key, attr]: any) => (
                <option key={key} value={key}>
                  {attr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Readonly Input: Merge Tag */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Copy Tag</label>
            <div className="relative">
              <input
                readOnly
                value={mergeTag}
                placeholder="{{Table.Field}}"
                className="w-full h-10 rounded-md border border-primary/30 bg-muted px-3 py-2 text-sm font-mono text-primary focus:outline-none"
              />
              {mergeTag && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(mergeTag)}
                  className="absolute right-2 top-1.5 p-1 hover:bg-background rounded text-primary transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Copy the tag above and paste it into your email body to personalize content.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Template Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Welcome Email"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Subtitle</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Short intro"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2 md:w-1/2">
          <label className="text-sm font-semibold">Subject Line</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email Subject"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Email Body</label>
          {/* <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            Supports Merge Tags
          </div> */}
        </div>
        <TiptapEditor value={body} onChange={setBody} />
      </div>

      <div className="flex justify-end border-t pt-6 gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 px-4 text-sm font-medium hover:underline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {loading ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
}