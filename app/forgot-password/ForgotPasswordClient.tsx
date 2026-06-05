"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

type Step = "email" | "code" | "password" | "complete";

function messageFromError(error: unknown) {
  if (!error) return "The request could not be completed. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const candidate = error as { longMessage?: string; message?: string; errors?: Array<{ longMessage?: string; message?: string }> };
    return candidate.longMessage ?? candidate.message ?? candidate.errors?.[0]?.longMessage ?? candidate.errors?.[0]?.message ?? "The request could not be completed. Please try again.";
  }
  return "The request could not be completed. Please try again.";
}

export default function ForgotPasswordClient() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const busy = fetchStatus === "fetching";

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { error: createError } = await signIn.create({ identifier: email });
    if (createError) {
      setError(messageFromError(createError));
      return;
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeError) {
      setError(messageFromError(sendCodeError));
      return;
    }

    setStep("code");
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyError) {
      setError(messageFromError(verifyError));
      return;
    }

    setStep("password");
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (submitError) {
      setError(messageFromError(submitError));
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setError(messageFromError(finalizeError));
        return;
      }
      setStep("complete");
      router.push("/dashboard");
      return;
    }

    setError("Additional verification is required before the password can be reset.");
  }

  return (
    <section className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
      <Link href="/sign-in" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold hover:opacity-70" style={{ color: "hsl(220 55% 20%)" }}>
        <ArrowLeft size={14} /> Back to sign in
      </Link>

      {step === "complete" ? (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "hsl(43 80% 60% / 0.18)", color: "hsl(43 80% 38%)" }}>
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Password Reset Complete</h1>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>Your MindReply account is secure. Redirecting to your dashboard.</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Recover Access</h1>
            <p className="break-words text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
              {step === "email" && "Enter your account email and MindReply will send a secure reset code."}
              {step === "code" && `Enter the reset code sent to ${email}.`}
              {step === "password" && "Set a new password for your MindReply account."}
            </p>
          </div>

          {error && <p className="mb-4 break-words rounded-lg border px-3 py-2 text-sm" style={{ color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</p>}

          {step === "email" && (
            <form className="space-y-4" onSubmit={sendCode}>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>Email Address</label>
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} placeholder="you@organisation.com" />
              </div>
              <button type="submit" disabled={busy || !email.trim()} className="w-full rounded-lg py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-45" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                {busy ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form className="space-y-4" onSubmit={verifyCode}>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>Reset Code</label>
                <input required inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} placeholder="Enter the code" />
              </div>
              <button type="submit" disabled={busy || !code.trim()} className="w-full rounded-lg py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-45" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                {busy ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {step === "password" && (
            <form className="space-y-4" onSubmit={submitPassword}>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(220 25% 45%)" }}>New Password</label>
                <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} placeholder="Minimum 8 characters" />
              </div>
              <button type="submit" disabled={busy || password.length < 8} className="w-full rounded-lg py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-45" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                {busy ? "Securing..." : "Set New Password"}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
