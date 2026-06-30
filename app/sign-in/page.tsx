"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] px-4 py-10 text-[#122033]">
      <div className="w-full max-w-sm rounded-3xl border border-[#122033]/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2f6f72]">Private control plane</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Sign in as owner</h1>
        <p className="mt-3 text-sm leading-6 text-[#59687b]">
          This surface is locked to the allowlisted GitHub account for the MindReply operator console.
        </p>
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#122033] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1c3150]"
        >
          Continue with GitHub
        </button>
        <div className="mt-4 text-center text-xs text-[#8a97a8]">
          Return to <Link href="/" className="font-semibold text-[#2f6f72]">public site</Link>
        </div>
      </div>
    </main>
  );
}
