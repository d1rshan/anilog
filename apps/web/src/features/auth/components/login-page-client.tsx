"use client";

import { useState } from "react";

import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

interface LoginPageClientProps {
  redirectTo: string;
}

export const LoginPageClient = ({ redirectTo }: LoginPageClientProps) => {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="flex min-h-[100svh] items-start justify-center overflow-y-auto px-4 pb-10 pt-20 md:items-center md:overflow-hidden md:pt-24">
      {showSignIn ? (
        <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} redirectTo={redirectTo} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} redirectTo={redirectTo} />
      )}
    </div>
  );
};
