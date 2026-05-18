import { ServerIcon } from "lucide-react";
import { NavItem } from "../nav-main";

/**
 * Projects Module Menu Item - Task Group 2.4
 *
 * Converted from simple Link component to navigation item object.
 * Returns a NavItem object for Projects navigation.
 *
 * Projects module is a simple navigation item (not a collapsible group)
 * pointing to the main projects page at /projects.
 *
 * @param title - Localized label for Projects module
 * @returns NavItem object for Projects navigation
 */

type Props = {
  localizations: {
    title: string;
    overview: string;
    projects: string;
    allTasks: string;
    // myTasks: string;
  };
  userId?: string;
  counts?: Record<string, number>;
};

const getBadgeValue = (counts: Record<string, number>, category: string) => {
  const count = counts?.[category] ?? 0;
  return count > 0 ? count : undefined;
};

export const getProjectsMenuItem = ({ localizations, userId, counts = {} }: Props): NavItem => {
  const projectsCount = getBadgeValue(counts, "Projects");
  const tasksCount = getBadgeValue(counts, "Tasks");

  return {
    title: localizations.title,
    icon: ServerIcon,
    badge: projectsCount,
    items: [
      {
        title: localizations.overview,
        url: "/projects/dashboard",
        badge: projectsCount,
      },
      {
        title: localizations.projects,
        url: "/projects",
      },
      {
        title: localizations.allTasks,
        url: "/projects/tasks",
        badge: tasksCount,
      },
      // {
      //   title: localizations.myTasks,
      //   url: userId ? `/projects/tasks/${userId}` : "/projects/tasks",
      // },
      // {
      //   title: localizations.contracts,
      //   url: "/projects/contracts",
      // },
    ],
  };
};

export default getProjectsMenuItem;
