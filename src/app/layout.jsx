import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-black text-zinc-100 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
