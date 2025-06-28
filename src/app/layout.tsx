import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/common/Navbar";

const rocaston = localFont({
  src: "../../public/fonts/Rocaston.ttf",
  variable: "--font-rocaston",
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Zica Bella",
  description: "Zica Bella",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased font-rocaston ${rocaston.variable}`}
      >
      

        {children}
      </body>
    </html>
  );
}
