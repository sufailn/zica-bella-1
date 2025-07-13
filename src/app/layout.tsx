import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import { Poppins } from "next/font/google";
import { ProductProvider } from "@/context/ProductContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import PageLoader from "@/components/common/PageLoader";

const rocaston = localFont({
  src: "../../public/fonts/Rocaston.ttf",
  variable: "--font-rocaston",
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        className={`antialiased ${poppins.variable} bg-black`}
      >
        <AuthProvider>
          <ToastProvider>
            <ProfileProvider>
              <ProductProvider>
                <PageLoader>
                  {children}
                </PageLoader>
              </ProductProvider>
            </ProfileProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
