import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchUnreadInboxCount } from "@/lib/imap";

export async function getUnreadEmailCount() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return 0;
  }

  try {
    return await fetchUnreadInboxCount({ userId: session.user?.id });
  } catch (error) {
    return 0;
  }
}
