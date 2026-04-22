"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "./TipTapEditor";

export default function TemplateEditForm({ id, initial = {} }: { id: string; initial?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title || "");
  const [subtitle, setSubtitle] = useState(initial.subtitle || "");
  const [subject, setSubject] = useState(initial.subject || "");
  const [body, setBody] = useState(initial.body || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, subject, body }),
      });
      if (res.ok) {
        router.push("/marketing/templates");
        router.refresh();
      } else {
        console.error(await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this template?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/marketing/templates");
        router.refresh();
      } else {
        console.error(await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Email Body</label>
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
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="h-10 px-4 text-sm font-medium text-destructive border border-input rounded"
        >
          Delete
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
