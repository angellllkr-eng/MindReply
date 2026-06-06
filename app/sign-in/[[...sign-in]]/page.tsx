import { SignIn } from "@clerk/nextjs";
import { AuthNotConfigured, AuthShell, clerkAppearance } from "@/components/AuthShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to MindReply.",
};

export default function SignInPage() {
  return (
    <AuthShell subtitle="Enter your communication intelligence workspace">
      {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
        <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      ) : (
        <AuthNotConfigured label="Sign In" />
      )}
    </AuthShell>
  );
}
