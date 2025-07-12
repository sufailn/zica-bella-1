"use client";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import Featured from "@/components/Home/Featured";
import Hero from "@/components/Home/Hero";
import ProductsSection from "@/components/Home/ProductSection";
import SlidingProducts from "@/components/Home/SlidingProducts";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoWarning, IoClose, IoShield } from 'react-icons/io5';
import Image from "next/image";

export default function Home() {
  const searchParams = useSearchParams();
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);

  useEffect(() => {
    const unauthorized = searchParams.get('unauthorized');
    if (unauthorized === 'admin') {
      setShowUnauthorizedAlert(true);
      
      // Clear the URL parameter after showing the alert
      const url = new URL(window.location.href);
      url.searchParams.delete('unauthorized');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return (
    <>
      <Navbar isHome={true} />
      
      {/* Unauthorized Admin Alert */}
      {showUnauthorizedAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
          <div className="bg-yellow-900 border border-yellow-600 text-yellow-100 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <IoWarning className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Admin Access Issue</h3>
                <p className="text-xs mt-1 text-yellow-200">
                  Your admin role may not be recognized by the system. Let's diagnose and fix this.
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href="/admin-setup"
                    className="inline-flex items-center gap-1 bg-yellow-600 text-black px-3 py-1 rounded text-xs font-medium hover:bg-yellow-700 transition"
                  >
                    <IoShield size={14} />
                    Diagnose & Fix
                  </a>
                </div>
              </div>
              <button
                onClick={() => setShowUnauthorizedAlert(false)}
                className="text-yellow-300 hover:text-yellow-100 flex-shrink-0"
              >
                <IoClose size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="font-literata text-2xl ">
        <Hero />
        <ProductsSection />
        <SlidingProducts />
        
        {/* <Featured /> */}
        <Footer />
      </div>
    </>
  );
}

