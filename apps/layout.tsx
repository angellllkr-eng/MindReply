import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'AgencyComm - Client Email Management',
  description: 'AI-assisted email management for creative agencies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <h1 className="text-2xl font-bold text-blue-600">AgencyComm</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}