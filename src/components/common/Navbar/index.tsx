"use client";
import Image from "next/image";
import { IoCartOutline } from "react-icons/io5";
import Sidebar from "../Sidebar";
import CartSidebar from "../CartSidebar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";

const Navbar = ({isHome}:{isHome:boolean}) => {
  const { cartCount } = useProducts();
  const [isScrolled, setIsScrolled] = useState(!isHome);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if(isHome){
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100); // Change background after scrolling 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }
  }, []);

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
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;