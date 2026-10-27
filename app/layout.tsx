import type { Metadata } from "next";
import { Figtree, Playfair_Display } from "next/font/google";
import { isDemoDatabase } from "@/db";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Wedspiration", template: "%s - Wedspiration" },
  description: "A visual inspiration archive for couples planning their wedding.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased text-stone-800 bg-stone-50">
        {isDemoDatabase && (
          <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
            Demo mode: sample data only, changes are reset when the server restarts. Log in as{" "}
            <strong>admin@admin.com</strong> or <strong>couple@example.com</strong> with the password{" "}
            <strong>password</strong>.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
