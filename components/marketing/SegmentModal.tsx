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
    ""
  );
  const [leadStatus, setLeadStatus] = useState("NEW");
  const [companySize, setCompanySize] = useState("");
  const [contactStatus, setContactStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Name must not be empty
  // 2. Segmentation type must be selected
  // 3. If ACCOUNT, a company size must be chosen
  const canSubmit =
    name.trim() !== "" &&
    segType !== "" &&
    (segType !== "ACCOUNT" || companySize !== "");

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const payload: any = { name, segmentationType: segType };
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

          <div className="flex gap-2">
            <label className="flex-1">
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
            </label>
          </div>

          {segType === "LEAD" && (
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

          {segType === "ACCOUNT" && (
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

          {segType === "CONTACT" && (
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