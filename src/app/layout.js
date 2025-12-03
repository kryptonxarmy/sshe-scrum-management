import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/use-toast";

// Removed next/font/google usage to avoid Turbopack internal font import issues.
// Using system fonts defined in `globals.css` as a safe fallback.

export const metadata = {
  title: "ExxonMobil SSHE - Safety Management Portal",
  description: "Safety, Security, Health & Environment Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
