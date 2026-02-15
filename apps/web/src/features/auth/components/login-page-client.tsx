"use client";

import { useState } from "react";

import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

export const LoginPageClient = () => {
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
};
