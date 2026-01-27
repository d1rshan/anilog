"use client";

import SignInForm from "@/features/auth/components/sign-in-form";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { useSession } from "../lib/hooks";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

export default function LoginPage() {
	const router = useRouter();
	const [showSignIn, setShowSignIn] = useState(false);
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (!isPending && session) {
			router.push("/");
		}
	}, [isPending, session, router]);

	if (isPending) {
		return <Loader />;
	}

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}
