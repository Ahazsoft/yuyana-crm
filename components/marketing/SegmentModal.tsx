"use client";

import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: any) => Promise<void>;
};

export default function SegmentModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [segType, setSegType] = useState<"LEAD" | "ACCOUNT" | "CONTACT" | "">(
    "",
  );
  const [segmentMode, setSegmentMode] = useState<"DYNAMIC" | "STATIC">(
    "STATIC",
  );
  const [leadStatus, setLeadStatus] = useState("NEW");
  const [companySize, setCompanySize] = useState("");
  const [contactStatus, setContactStatus] = useState("ACTIVE");
  const [emails, setEmails] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Name must not be empty
  // 2. Segmentation type must be selected
  // 3. If ACCOUNT, a company size must be chosen
  // Allow submission either with CSV emails (CUSTOM) OR with segmentation filters (DYNAMIC)
  const canSubmit =
    name.trim() !== "" &&
    ((segmentMode === "DYNAMIC" && emails.length > 0) ||
      (segmentMode === "STATIC" &&
        segType !== "" &&
        (segType !== "ACCOUNT" || companySize !== "")));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const payload: any = { name };
    if (segmentMode === "DYNAMIC") {
      payload.type = "DYNAMIC";
      payload.emails = emails;
      payload.segmentationType = "LEAD";
    } else {
      payload.type = "STATIC";
      payload.segmentationType = segType;
    }
    if (segType === "LEAD")
      payload.leadFilters = [
        { field: "status", operator: "equals", value: leadStatus },
      ];
    if (segType === "ACCOUNT")
      payload.accountFilters = [
        { field: "companySize", operator: "equals", value: companySize },
      ];
    if (segType === "CONTACT")
      payload.contactFilters = [
        { field: "status", operator: "equals", value: contactStatus },
      ];

    await onCreate(payload);
    setIsSubmitting(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 z-10 w-full max-w-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Create Segment</h3>
          <p className="text-sm text-muted-foreground">
            Choose segmentation type and rules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Segment name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-4 items-center">
            <div>
              <div className="text-xs mb-1">Segment Mode</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="segmentMode"
                    value="STATIC"
                    checked={segmentMode === "STATIC"}
                    onChange={() => setSegmentMode("STATIC")}
                  />
                  <span className="text-sm">Static</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="segmentMode"
                    value="DYNAMIC"
                    checked={segmentMode === "DYNAMIC"}
                    onChange={() => setSegmentMode("DYNAMIC")}
                  />
                  <span className="text-sm">Dynamic</span>
                </label>
              </div>
            </div>
          </div>
          {segmentMode === "DYNAMIC" && (
            <div className="border rounded p-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs mb-1">Upload CSV File</div>
                  <div className="text-[11px] text-muted-foreground">
                    Each lines first column should contain an email.
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={async (e) => {
                      setCsvError(null);
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const txt = await file.text();
                        const lines = txt
                          .split(/\r?\n/)
                          .map((l) => l.trim())
                          .filter(Boolean);
                        const parsed: string[] = [];
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        for (const line of lines) {
                          // take first comma-separated value
                          const first = line
                            .split(",")[0]
                            .trim()
                            .replace(/^"|"$/g, "");
                          if (!first) continue;
                          if (!emailRegex.test(first)) continue;
                          parsed.push(first.toLowerCase());
                        }
                        const unique = Array.from(new Set(parsed));
                        if (unique.length === 0)
                          setCsvError("No valid emails found in CSV.");
                        setEmails(unique);
                      } catch (err) {
                        setCsvError("Failed to read CSV file.");
                        setEmails([]);
                      }
                    }}
                  />
                </div>
              </div>

              {csvError && (
                <div className="text-xs text-red-500 mt-2">{csvError}</div>
              )}
              {emails.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  Parsed {emails.length} unique emails
                </div>
              )}
            </div>
          )}

          {segmentMode === "STATIC" && (
            <div>
              <div className="text-xs mb-1">Segmentation type</div>
              <select
                className="w-full border p-2 rounded"
                value={segType}
                onChange={(e) => setSegType(e.target.value as any)}
              >
                <option value="">Select type</option>
                <option value="LEAD">Lead</option>
                <option value="ACCOUNT">Company</option>
                <option value="CONTACT">Contact</option>
              </select>
            </div>
          )}

          {segmentMode === "STATIC" && segType === "LEAD" && (
            <div>
              <div className="text-xs mb-1">Lead status</div>
              <select
                className="w-full border p-2 rounded"
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
              </select>
              <div className="text-xs text-muted-foreground mt-1">
                Note: Lost is excluded from default options.
              </div>
            </div>
          )}

          {segmentMode === "STATIC" && segType === "ACCOUNT" && (
            <div>
              <div className="text-xs mb-1">Company size</div>
              <select
                className="w-full border p-2 rounded"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="">Select size</option>
                <option value="SMALL">Small (&lt;50)</option>
                <option value="MEDIUM">Medium (50-250)</option>
                <option value="LARGE">Large (&gt;250)</option>
              </select>
              {segType === "ACCOUNT" && companySize === "" && (
                <p className="text-xs text-red-500 mt-1">
                  Please select a company size.
                </p>
              )}
            </div>
          )}

          {segmentMode === "STATIC" && segType === "CONTACT" && (
            <div>
              <div className="text-xs mb-1">Contact status</div>
              <select
                className="w-full border p-2 rounded"
                value={contactStatus}
                onChange={(e) => setContactStatus(e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button
              className="px-3 py-2 rounded border"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded bg-primary text-white"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
