"use client";
import Image from "next/image";
import { IoCartOutline } from "react-icons/io5";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100); // Change background after scrolling 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`flex items-center justify-between p-4 text-white h-20 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-black" : "bg-transparent"
      }`}
    >
      <div>
        <Sidebar />
      </div>
      <div className="flex items-center justify-center w-full gap-2">
        <Image
          src="/logo-white.png"
          alt="Logo"
          width={40}
          height={50}
          className="cursor-pointer"
        />
        <p>ZICA BELLA</p>
      </div>
      <div>
        <IoCartOutline className="text-3xl cursor-pointer" />
      </div>
    </nav>
  );
};

export default Navbar;