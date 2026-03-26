import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SellProvider } from "@/lib/SellContext";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vanguard — Sell & Rebalance",
  description: "Optimize your portfolio withdrawal with Vanguard's Sell & Rebalance tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body><SellProvider>{children}</SellProvider><Analytics /></body>
    </html>
  );
}
