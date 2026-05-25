import React, { Suspense } from "react";
import Container from "../components/ui/Container2";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

import ProjectsView from "./_components/ProjectsView";
import SuspenseLoading from "@/components/loadings/suspense";
import { getTranslations } from "next-intl/server";
import NewProjectDialog from "./dialogs/NewProject";
import { ShieldX , Lock} from "lucide-react";

export const maxDuration = 300;

const ProjectsPage = async () => {
  const session: Session | null = await getServerSession(authOptions);
  const t = await getTranslations("ProjectsPage");

  if (!session) return redirect("/sign-in");

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="mx-5">
        <Container
          title="Projects"
          description={
            "Manage your projects"
          }
        >
          <div className="flex flex-col items-center justify-center py-12 px-6">
            {/* Icon Container */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-6 rounded-full ring-1 ring-red-200 dark:ring-red-800">
                <ShieldX
                  className="w-16 h-16 text-red-500 dark:text-red-400"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Main Message */}
            <div className="space-y-3 max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Hello {session.user.name}
              </h2>

              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <p className="text-lg">
                  You're not allowed to access this page.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This page is only available for administrators.
              </p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <Container
      title={t("title")}
      description={t("description")}
      buttonComponent={<NewProjectDialog />}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <ProjectsView />
      </Suspense>
    </Container>
  );
};

export default ProjectsPage;
