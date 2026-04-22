"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "./TipTapEditor";

export default function TemplateForm({ initial = {} }: { initial?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title || "");
  const [subject, setSubject] = useState(initial.subject || "");
  const [body, setBody] = useState(initial.body || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subject, body }),
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Template Title</label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Welcome Email"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Subject Line</label>
          <input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Email Subject"
            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Email Body</label>
        <TiptapEditor value={body} onChange={setBody} />
      </div>

      <div className="flex justify-end border-t pt-6">
        <button 
          type="submit" 
          disabled={loading} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8"
        >
          {loading ? "Saving..." : "Save Template"}
        </button>
      </div>
    </form>
  );
}