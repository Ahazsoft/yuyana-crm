import { prismadb } from "@/lib/prisma";

export const getModules = async () => {
  const data = await prismadb.system_Modules_Enabled.findMany({
    orderBy: [{ position: "asc" }],
  });
  console.log("Modules data:", data); // Debug log to check the structure of the data
  return data;
};
