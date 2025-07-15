import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import { ProductProvider } from "@/context/ProductContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";
import CustomTopLoader from "@/components/common/CustomTopLoader";
import RouterEvents from "@/components/common/RouterEvents";
import NextTopLoader from 'nextjs-toploader';

const rocaston = localFont({
  src: "../../public/fonts/Rocaston.ttf",
  variable: "--font-rocaston",
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});


const glacialIndifference = localFont({
  src: "../../public/fonts/GlacialIndifference-Regular.ttf",
  variable: "--font-poppins",
  display: "swap",
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
});

export const font = glacialIndifference;

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
        className={`antialiased ${glacialIndifference.variable} bg-black`}
      >
        <NextTopLoader color="#fff" height={3} showSpinner={false} />
        <RouterEvents />
        <AuthProvider>
          <ToastProvider>
            <ProfileProvider>
              <ProductProvider>
                <CustomTopLoader>
                  {children}
                </CustomTopLoader>
              </ProductProvider>
            </ProfileProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
