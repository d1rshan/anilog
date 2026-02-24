import { headers } from "next/headers";

import { requireCurrentUser } from "@/features/auth/lib/server";

import { AdminDashboard } from "../components/admin-dashboard";

export const AdminPage = async () => {
  await requireCurrentUser(await headers());

  return <AdminDashboard />;
};
