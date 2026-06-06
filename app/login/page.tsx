import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthNotConfigured, AuthShell, clerkAppearance } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Sign in to the MindReply member workspace.",
};

export default function LoginPage() {
  return (
    <AuthShell subtitle="Sign in to your MindReply workspace">
      {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
        <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      ) : (
        <AuthNotConfigured label="Member Login" />
      )}
    </AuthShell>
  );
}
