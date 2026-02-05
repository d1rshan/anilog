"use client";

import SignInForm from "@/features/auth/components/sign-in-form";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { useState } from "react";

export default function LoginPageClient() {
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<div className="h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 overflow-hidden">
			{showSignIn ? (
				<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
			) : (
				<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
			)}
		</div>
	);
}
