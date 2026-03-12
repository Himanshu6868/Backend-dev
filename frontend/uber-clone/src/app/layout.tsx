import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideFlow UI",
  description: "Frontend-only Uber style rider and captain experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
