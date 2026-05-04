"use client";

import { useState } from "react";

export default function SegmentMembersEditor({ segmentId, initialEmails = [], isCustom = false }: any) {
  const [emails, setEmails] = useState<string[]>(initialEmails || []);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const addEmail = () => {
    const e = (input || "").trim().toLowerCase();
    if (!e) return;
    if (!/^\S+@\S+\.\S+$/.test(e)) {
      setStatus("Invalid email");
      return;
    }
    if (!emails.includes(e)) setEmails((s) => [...s, e]);
    setInput("");
  };

  const removeEmail = (em: string) => setEmails((s) => s.filter((x) => x !== em));

  const save = async () => {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`/api/marketing/segments/${segmentId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, replace: true }),
      });
      if (res.ok) {
        const j = await res.json();
        setStatus(`Saved (${j.count} members)`);
      } else {
        setStatus("Save failed");
      }
    } catch (e) {
      setStatus("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {!isCustom && <div className="text-sm text-muted-foreground">This segment isn't custom; member editing is disabled.</div>}

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="add@email.com" className="flex-1 border px-2 py-1 rounded" />
        <button type="button" onClick={addEmail} className="px-3 py-1 border rounded">Add</button>
      </div>

      <div className="space-y-1 max-h-48 overflow-auto border rounded p-2">
        {emails.length === 0 && <div className="text-xs text-muted-foreground">No members</div>}
        {emails.map((em) => (
          <div key={em} className="flex items-center justify-between text-sm">
            <div className="truncate">{em}</div>
            <button onClick={() => removeEmail(em)} className="text-xs text-red-500">Remove</button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        <div className="text-sm text-muted-foreground">{status}</div>
        <button onClick={save} disabled={!isCustom || saving} className="px-3 py-1 bg-primary text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  );
}
