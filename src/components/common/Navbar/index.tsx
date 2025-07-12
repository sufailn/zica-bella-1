"use client";
import Image from "next/image";
import { IoCartOutline, IoPersonOutline } from "react-icons/io5";
import Sidebar from "../Sidebar";
import CartSidebar from "../CartSidebar";
import AuthModal from "../AuthModal";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/hooks/useAuthModal";

const Navbar = ({isHome}:{isHome:boolean}) => {
  const { cartCount } = useProducts();
  const { isAuthenticated, userProfile, logout } = useAuth();
  const authModal = useAuthModal();
  const [isScrolled, setIsScrolled] = useState(!isHome);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Memoize the scroll handler to prevent infinite loops
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    setIsScrolled(scrollTop > 100);
  }, []);

  useEffect(() => {
    if (isHome) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isHome]);

  // Close user menu when user is no longer authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowUserMenu(false);
    }
  }, [isAuthenticated]);

  return (
    <nav
      className={`flex items-center justify-between p-4 text-white h-20 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black " : "bg-transparent "
      }`}
    >
      <div>
        <Sidebar isScrolled={isScrolled}/>
      </div>
      <Link href="/" className="flex items-center justify-center w-full gap-2">
        <Image
          src={isScrolled ? "/logo-white.png" : "/logo-white.png"}
          alt="Logo"
          width={40}
          height={50}
          className="cursor-pointer"
        />
        <p className={`${isScrolled ? "text-white" : "text-white"} font-rocaston`}>ZICA BELLA</p>
      </Link>
      <div className="flex items-center gap-3">
        {/* User Authentication */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:scale-110 transition-transform duration-200"
            >
              <IoPersonOutline className="text-2xl" />
              {userProfile?.first_name && (
                <span className="hidden md:block text-sm">
                  {userProfile.first_name}
                </span>
              )}
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/profile?tab=orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Orders
                </Link>
                {userProfile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-1" />
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={authModal.openLogin}
            className="hover:scale-110 transition-transform duration-200 text-sm font-medium"
          >
            Sign In
          </button>
        )}

        {/* Cart */}
        <div className="relative">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2"
          >
            <IoCartOutline className={`text-3xl cursor-pointer ${isScrolled ? "text-white" : "text-white"} hover:scale-110 transition-transform duration-200`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={authModal.close}
        defaultMode={authModal.mode}
      />
    </nav>
  );
};

export default Navbar;