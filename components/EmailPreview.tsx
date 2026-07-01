// components/EmailPreview.tsx
import { render } from '@react-email/render';
import { useEffect, useRef } from 'react';
import InviteUserEmail from '@/emails/InviteUser';

interface EmailPreviewProps {
  username: string;
  invitedByUsername: string;
  invitedUserPassword: string;
  userLanguage: string;
}

export default function EmailPreview({
  username,
  invitedByUsername,
  invitedUserPassword,
  userLanguage,
}: EmailPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // ✅ Use an async IIFE to handle the Promise
    const renderEmail = async () => {
      try {
        const emailHtml = await render(
          <InviteUserEmail
            username={username}
            invitedByUsername={invitedByUsername}
            invitedUserPassword={invitedUserPassword}
            userLanguage={userLanguage}
          />
        );

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(emailHtml);
        doc.close();
      } catch (error) {
        console.error('Failed to render email:', error);
      }
    };

    renderEmail();
  }, [username, invitedByUsername, invitedUserPassword, userLanguage]);

  return (
    <iframe
      
      ref={iframeRef}
      className="w-full h-[800px] border border-gray-200 rounded-md"
      title="Email Preview"
      sandbox="allow-same-origin"
    />
  );
}