import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(220 55% 20%)" }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "hsl(220 45% 13%)" }}>Sign In to MindReply</h1>
          <p className="text-sm" style={{ color: "hsl(220 25% 45%)" }}>Access your communication intelligence dashboard.</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard'; }}>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "hsl(220 25% 45%)" }}>Email Address</label>
            <input type="email" required className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} placeholder="you@organisation.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: "hsl(220 25% 45%)" }}>Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }} placeholder="••••••••" />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2" style={{ color: "hsl(220 25% 45%)" }}>
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <Link href="#" className="font-medium hover:underline" style={{ color: "hsl(220 55% 20%)" }}>Forgot password?</Link>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
            Sign In
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "hsl(220 25% 45%)" }}>
          Don't have an account? <Link href="/signup" className="font-semibold hover:underline" style={{ color: "hsl(43 80% 60%)" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
