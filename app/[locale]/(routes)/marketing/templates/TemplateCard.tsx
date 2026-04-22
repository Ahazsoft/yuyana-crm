"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateText } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { toast } from "react-hot-toast";

export default function TemplateCard({ template }: { template: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const getPreviewText = (body: any) => {
    if (!body) return "";
    try {
      return generateText(body, [StarterKit, Image]);
    } catch (e) {
      return "";
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/marketing/templates/${template.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Template deleted");
      router.refresh(); // Reloads the server data
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group rounded-2xl border bg-background/60 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="h-2 w-full bg-gradient-to-r from-slate-400 via-slate-200 to-muted" />

      <div className="p-5 space-y-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="flex-1 font-semibold text-sm text-foreground line-clamp-2 leading-snug pt-0.5">
              {template.title}
            </h3>
            <span className="text-[11px] leading-5 text-muted-foreground whitespace-nowrap pt-0.5">
              {new Date(template.createdAt).toLocaleDateString()}
            </span>
          </div>

          {template.subject && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-5">
              {template.subject}
            </p>
          )}

          {template.body && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-3">
              {getPreviewText(template.body)}
            </p>
          )}
        </div>

        <div className="pt-1 grid grid-cols-3 items-end gap-2 text-xs">
          <Link
            href={`/marketing/templates/${template.id}`}
            className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition"
          >
            Edit
          </Link>

          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-xl border px-2 py-2 hover:bg-accent transition"
          >
            Use
          </Link>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-xl border hover:bg-destructive/10 text-destructive px-2 py-2 transition disabled:opacity-50"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}