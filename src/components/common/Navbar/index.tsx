"use client";
import Image from "next/image";
import { IoCartOutline } from "react-icons/io5";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = ({isHome}:{isHome:boolean}) => {
  
  const [isScrolled, setIsScrolled] = useState(!isHome);

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
        isScrolled ? "bg-white" : "bg-transparent"
      }`}
    >
      <div>
        <Sidebar isScrolled={isScrolled}/>
      </div>
      <Link href="/" className="flex items-center justify-center w-full gap-2">
        <Image
          src={isScrolled ? "/logo.png" : "/logo-white.png"}
          alt="Logo"
          width={40}
          height={50}
          className="cursor-pointer"
        />
        <p className={isScrolled ? "text-black" : "text-white"}>ZICA BELLA</p>
      </Link>
      <div>
        {/* <IoCartOutline className={`text-3xl cursor-pointer ${isScrolled ? "text-black" : "text-white"}`} /> */}
      </div>
    </nav>
  );
};

export default Navbar;