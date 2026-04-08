import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Driver Application – kBola LLC",
  description: "CDL Class A Truck Driver Job Application – kBola LLC, Texas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
