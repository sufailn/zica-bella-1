import type { Metadata } from "next";
import { Literata } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";


const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["200","300","400", "500", "600", "700"],
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
        className={`antialiased  ${literata.variable}`}
      >
      

        {children}
      </body>
    </html>
  );
}
