"use client";

import React, { useState } from "react";
import axios from "axios";

type Props = {
  segmentId: string;
};

export default function SegmentBulkUpload({ segmentId }: Props) {
  const [emails, setEmails] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file?: File) => {
    setCsvError(null);
    if (!file) return setEmails([]);
    try {
      const txt = await file.text();
      const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const parsed: string[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const line of lines) {
        const first = line.split(",")[0].trim().replace(/^"|"$/g, "");
        if (!first) continue;
        if (!emailRegex.test(first)) continue;
        parsed.push(first.toLowerCase());
      }
      const unique = Array.from(new Set(parsed));
      if (unique.length === 0) setCsvError("No valid emails found in CSV.");
      setEmails(unique);
    } catch (err) {
      setCsvError("Failed to read CSV file.");
      setEmails([]);
    }
  };

  const handleUpload = async () => {
    if (emails.length === 0) return;
    setIsUploading(true);
    try {
      const res = await axios.post(`/api/marketing/segments/${segmentId}/members`, { emails });
      if (res.status === 200) {
        alert(`Uploaded ${res.data.count || emails.length} emails`);
        setEmails([]);
        // refresh
        window.location.reload();
      } else {
        alert('Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs">Bulk upload additional emails</div>
          <div className="text-[11px] text-muted-foreground">CSV with one email per line (first column used)</div>
        </div>
        <div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {csvError && <div className="text-xs text-red-500">{csvError}</div>}
      {emails.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Parsed {emails.length} unique emails</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border"
              onClick={() => setEmails([])}
              disabled={isUploading}
            >
              Clear
            </button>
            <button
              className="px-3 py-1 rounded bg-primary text-white"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
