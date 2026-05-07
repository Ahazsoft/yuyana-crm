"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/marketing/TipTapEditor";
import { TemplateSearchCombobox } from "@/components/ui/template-search-combobox";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ComposeLauncher({ initialTemplates = [] }: any) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [editorValue, setEditorValue] = useState<any>(null);
  const [bodyHtml, setBodyHtml] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedTemplateId) {
      setSubject("");
      setEditorValue(null);
      return;
    }

    let cancelled = false;
    const fetchTemplate = async () => {
      setTemplateLoading(true);
      try {
        const res = await fetch(`/api/marketing/templates/${selectedTemplateId}`);
        if (!res.ok) return;
        const template = await res.json();
        if (cancelled) return;

        let parsedBody = template.body;
        if (typeof template.body === "string") {
          try {
            parsedBody = JSON.parse(template.body);
          } catch {
            // keep as raw string (maybe already HTML)
            parsedBody = template.body;
          }
        }

        setSubject(template.subject || "");
        setEditorValue(parsedBody);
        if (typeof parsedBody === "string" && parsedBody.trim().startsWith("<")) {
          setBodyHtml(parsedBody);
        } else {
          setBodyHtml("");
        }
      } catch (err) {
        console.error("Failed to fetch template:", err);
      } finally {
        if (!cancelled) setTemplateLoading(false);
      }
    };

    fetchTemplate();
    return () => {
      cancelled = true;
    };
  }, [selectedTemplateId]);

  const send = async () => {
    setSending(true);
    try {
      const htmlToSend = bodyHtml || (typeof editorValue === "string" ? editorValue : JSON.stringify(editorValue || ""));

      const payload = {
        to,
        subject,
        html: htmlToSend,
        text: "",
      };

      const res = await fetch(`/api/marketing/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to send");
      }

      // close and reset
      setOpen(false);
      setTo("");
      setSubject("");
      setEditorValue(null);
      setBodyHtml("");
      toast({ title: "Email sent", description: "Message delivered" });
    } catch (err) {
      console.error(err);
        //@ts-ignore
      const msg = err?.message || "Failed to send email.";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div>
        <Button onClick={() => setOpen(true)} className="bg-primary">
          Compose Email
        </Button>
      </div>

      {open && (
        <div className="fixed right-4 bottom-4 z-50 w-[700px] max-w-[95vw] bg-popover border rounded shadow-lg overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">New Message</h3>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">To</label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Load Template</label>
              <TemplateSearchCombobox
                value={selectedTemplateId}
                onChange={(id) => setSelectedTemplateId(id)}
                initialTemplates={initialTemplates}
              />
              {templateLoading && (
                <p className="text-sm text-muted-foreground">Loading template...</p>
              )}
            </div>

            <div>
              <TiptapEditor
                value={editorValue}
                onChange={(v) => setEditorValue(v)}
                onChangeHtml={(h) => setBodyHtml(h)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={send} disabled={sending || !to || !subject || (!bodyHtml && !editorValue)}>
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
