import { SignUp } from "@clerk/nextjs";
import { AuthNotConfigured, AuthShell, clerkAppearance } from "@/components/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell subtitle="Begin your MindReply strategist workspace">
      {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
        <SignUp appearance={clerkAppearance} fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
      ) : (
        <AuthNotConfigured label="Create Your Account" />
      )}
    </AuthShell>
  );
}
