import { Coins } from "lucide-react";
import { NavItem } from "../nav-main";

/**
 * CRM Module Menu Item - Task Group 2.3
 *
 * Converted from DropdownMenu pattern to collapsible sidebar group.
 * Returns a NavItem object with sub-items for all CRM routes.
 *
 * @param localizations - Localized labels for CRM module items
 * @param counts - Unread notification counts by CRM category
 * @returns NavItem object with collapsible sub-items for CRM navigation
 */

type Props = {
  localizations: {
    title: string;
    accounts: string;
    contacts: string;
    leads: string;
    opportunities: string;
    contracts: string;
  };
  counts?: Record<string, number>;
};

const getBadgeValue = (counts: Record<string, number>, category: string) => {
  const count = counts?.[category] ?? 0
  return count > 0 ? count : undefined
}

export const getCrmMenuItem = ({ localizations, counts = {} }: Props): NavItem => {
  const crmCategories = [
    "Leads",
    "Accounts",
    "Contacts",
    "Contracts",
    "Opportunities",
  ]

  const totalCount = crmCategories.reduce(
    (sum, category) => sum + (counts[category] ?? 0),
    0,
  )

  return {
    title: localizations.title,
    icon: Coins,
    badge: totalCount > 0 ? totalCount : undefined,
    items: [
      {
        title: localizations.leads,
        url: "/crm/leads",
        badge: getBadgeValue(counts, "Leads"),
      },
      {
        title: localizations.accounts,
        url: "/crm/accounts",
        badge: getBadgeValue(counts, "Accounts"),
      },
      {
        title: localizations.contacts,
        url: "/crm/contacts",
        badge: getBadgeValue(counts, "Contacts"),
      },
      {
        title: localizations.contracts,
        url: "/crm/contracts",
        badge: getBadgeValue(counts, "Contracts"),
      },
      {
        title: localizations.opportunities,
        url: "/crm/opportunities",
        badge: getBadgeValue(counts, "Opportunities"),
      },
    ],
  }
}

export default getCrmMenuItem;
