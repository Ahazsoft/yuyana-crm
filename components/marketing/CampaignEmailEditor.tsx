"use client";

import { useState, useEffect } from "react";
import TiptapEditor from "@/components/marketing/TipTapEditor";

export default function CampaignEmailEditor({
  campaignId,
  initialSubject = "",
  initialBody = null,
  initialTo = "",
}: {
  campaignId: string;
  initialSubject?: string;
  initialBody?: any;
  initialTo?: string;
}) {
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState(initialBody || null);
  const [to, setTo] = useState<string | null>(initialTo || "");
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // load segments for dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/marketing/segments');
        if (!res.ok) return;
        const j = await res.json();
        if (!mounted) return;
        setSegments(j.data || []);
      } catch (e) {
        console.error('Failed to load segments', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // persist draft to localStorage on change so Send button can read latest
  useEffect(() => {
    try {
      localStorage.setItem(`campaign-email-${campaignId}`, JSON.stringify({ subject, body, to }));
    } catch (e) {}
  }, [subject, body, to, campaignId]);

  const save = async () => {
    setLoading(true);
    setStatus("");
    try {
      // Try to POST to a campaign email endpoint. Backend may be added later.
      const res = await fetch(`/api/marketing/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, to }),
      });

      if (res.ok) {
        setStatus("Saved");
        try {
          localStorage.removeItem(`campaign-email-${campaignId}`);
        } catch (e) {}
      } else {
        try {
          localStorage.setItem(
            `campaign-email-${campaignId}`,
            JSON.stringify({ subject, body, to })
          );
        } catch (e) {}
        setStatus("Saved locally (no API)");
      }
    } catch (err) {
      try {
        localStorage.setItem(
          `campaign-email-${campaignId}`,
          JSON.stringify({ subject, body, to })
        );
      } catch (e) {}
      setStatus("Saved locally (network error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="text-sm font-semibold">Email Subject</label>
          <div className="flex gap-2">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            />
            <select
              value={to || ""}
              onChange={(e) => setTo(e.target.value || null)}
              className="h-10 rounded-md border px-2 bg-background"
            >
              <option value="">To: (none)</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type === 'STATIC' ? 'Static' : 'Dynamic'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Email Body</label>
        <TiptapEditor value={body} onChange={setBody} />
      </div>

      <div className="flex items-center justify-end gap-3">
        <div className="text-sm text-muted-foreground">{status}</div>
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Email"}
        </button>
      </div>
    </div>
  );
}
