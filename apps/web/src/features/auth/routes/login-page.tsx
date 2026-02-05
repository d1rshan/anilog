import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/features/auth/lib/server";
import LoginPageClient from "@/features/auth/components/login-page-client";

export default async function LoginPage() {
	const session = await getSession(await headers());

	if (session?.user) {
		redirect("/");
	}

	return <LoginPageClient />;
}
