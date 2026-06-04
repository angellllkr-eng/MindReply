import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">404</p>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm">
          Return Home
        </Link>
      </div>
    </div>
  );
}
