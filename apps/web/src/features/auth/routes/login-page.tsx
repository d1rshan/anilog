"use client";

import SignInForm from "@/features/auth/components/sign-in-form";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { useRedirectIfAuthenticated } from "../lib/hooks";
import { useState } from "react";
import Loader from "@/components/loader";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(false);
	const { isPending } = useRedirectIfAuthenticated();

	if (isPending) {
		return <Loader />;
	}

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}
