
import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "MCP Test Project",
    template: "%s | MCP Test Project",
  },
  description:
    "MCP Test Project dashboard for AI client tools and order management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
