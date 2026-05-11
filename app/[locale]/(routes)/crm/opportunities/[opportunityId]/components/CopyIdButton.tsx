"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopyId = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopyId}
      className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      title="Copy ID"
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
      )}
      <span className="font-mono">{copied ? "Copied!" : "Copy ID"}</span>
    </button>
  );
}
