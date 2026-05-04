"use client";

import React, { useState } from "react";

type Props = { campaignId: string; initialTo?: string };

export default function CampaignSendButton({ campaignId, initialTo }: Props) {
  const [sending, setSending] = useState(false);

  const onSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      // read draft from localStorage if available
      let draft: any = null;
      try {
        const raw = localStorage.getItem(`campaign-email-${campaignId}`);
        if (raw) draft = JSON.parse(raw);
      } catch (e) {}

      // if no draft, fetch campaign server data
      let subject = draft?.subject || "";
      let body = draft?.body || null;
      let to = draft?.to || initialTo || null;

      if (!subject || !body) {
        // fetch campaign to get saved content
        const res = await fetch(`/api/marketing/campaigns/${campaignId}`,{
             credentials: 'include', 
        });
        if (res.ok) {
          const j = await res.json();
          subject = subject || j.emailSubject || "";
          body = body || (j.emailContent ? (typeof j.emailContent === 'string' ? j.emailContent : j.emailContent) : null);
          to = to || j.targetAudience || null;
        }
      }

      if (!subject || !body) {
        alert('Email subject and body are required to send');
        setSending(false);
        return;
      }

      const payload = { subject, body, to };

      const res = await fetch(`/api/marketing/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
         credentials: 'include', 
      });

      if (!res.ok) {
        const txt = await res.text();
        alert('Send failed: ' + txt);
      } else {
        const j = await res.json();
        alert(`Sent to ${j.totalRecipients} recipients`);
      }
    } catch (e) {
      console.error(e);
      alert('Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <button onClick={onSend} disabled={sending} className="px-3 py-1 rounded bg-primary text-white">
      {sending ? 'Sending...' : 'Send Now'}
    </button>
  );
}
