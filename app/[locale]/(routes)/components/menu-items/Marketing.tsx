import { Megaphone } from "lucide-react";
import { NavItem } from "../nav-main";

/**
 * Marketing Module Menu Item
 *
 * Creates a collapsible sidebar group for marketing functionality.
 * Returns a NavItem object with sub-items for all marketing routes.
 *
 * @param localizations - Localized labels for marketing module items
 * @returns NavItem object with collapsible sub-items for marketing navigation
 */

type Props = {
  localizations: {
    title: string;
    campaigns: string;
    segments: string;
    templates: string;
    analytics: string;
  };
};

export const getMarketingMenuItem = ({ localizations }: Props): NavItem => {
  return {
    title: localizations.title,
    icon: Megaphone,
    items: [
      {
        title: "Overview",
        url: "/marketing",
      },
      {
        title: localizations.campaigns,
        url: "/marketing/campaigns",
      },
      {
        title: localizations.segments,
        url: "/marketing/segments",
      },
      {
        title: localizations.templates,
        url: "/marketing/templates",
      },
      {
        title: "Emails",
        url: "/marketing/emails",
      },
      // {
      //   title: localizations.analytics,
      //   url: "/marketing/analytics",
      // },
    ],
  };
};

export default getMarketingMenuItem;