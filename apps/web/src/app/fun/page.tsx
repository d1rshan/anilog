import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/features/auth/lib/server";
import FunPageClient from "./fun-page-client";

export default async function FunPage() {
  const session = await getSession(await headers());

  if (!session?.user) {
    redirect("/login");
  }

  return <FunPageClient />;
}
