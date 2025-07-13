"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CiMenuFries } from "react-icons/ci";
import { IoClose } from 'react-icons/io5';
import { LuChevronRight } from 'react-icons/lu';
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';
import { FaYoutube, FaGoogle } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

const Sidebar: React.FC<{isScrolled:boolean}> = ({isScrolled}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 14,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 14,
      },
    },
  };

  const backdropVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-2 rounded-md  ${!isOpen ? 'text-white': 'hidden'}`}
      >
        <CiMenuFries size={24} className={`${isScrolled ? 'text-white' : 'text-white'}`}/>
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black z-30"
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={toggleSidebar}
            />

            {/* Sidebar Content */}
            <motion.div 
              className="fixed top-0 left-0 h-full w-full max-w-lg bg-black shadow-lg z-40 flex flex-col p-0 rounded-xl" 
              variants={sidebarVariants as any}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Close Button */}
              <div className="p-4 flex items-center justify-between border-b border-gray-700">
                <div
                  onClick={toggleSidebar}
                  className="rounded-md flex items-center gap-2 cursor-pointer text-white hover:text-gray-300"
                >
                  <IoClose size={24} />
                  <p>Close</p>
                </div>
              </div>

              {/* Sidebar Items */}
              <nav className="flex-1 p-0">
                <ul className="divide-y divide-gray-700">
                  {/* All Products Link */}
                  <li className='flex items-center gap-2 justify-between px-6 py-4 hover:bg-gray-900 cursor-pointer'>
                    <Link
                      href="/shop"
                      className="text-white font-bold text-lg flex-1"
                      onClick={toggleSidebar}
                    >
                      ALL PRODUCTS
                    </Link>
                    <LuChevronRight className="inline-block ml-2 text-white" size={22}/>
                  </li>
                  
                  {/* Dynamic Categories */}
                  {loading ? (
                    // Loading skeleton
                    [...Array(3)].map((_, index) => (
                      <li key={index} className='flex items-center gap-2 justify-between px-6 py-4'>
                        <div className="h-6 bg-gray-700 rounded animate-pulse flex-1"></div>
                        <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                      </li>
                    ))
                  ) : (
                    categories.map((category) => (
                      <li key={category.id} className='flex items-center gap-2 justify-between px-6 py-4 hover:bg-gray-900 cursor-pointer'>
                        <Link
                          href={`/shop/category/${category.slug}`}
                          className="text-white font-bold text-lg flex-1"
                          onClick={toggleSidebar}
                        >
                          {category.name.toUpperCase()}
                        </Link>
                        <LuChevronRight className="inline-block ml-2 text-white" size={22}/>
                      </li>
                    ))
                  )}
                </ul>
                {/* About & Contact */}
                <ul className="mt-auto divide-y divide-gray-700">
                  <li className='flex items-center gap-2 justify-between px-6 py-4 hover:bg-gray-900 cursor-pointer'>
                    <Link
                      href="/about"
                      className="text-white text-md flex-1"
                      onClick={toggleSidebar}
                    >
                      ABOUT US
                    </Link>
                    <LuChevronRight className="inline-block ml-2 text-white" size={20}/>
                  </li>
                  <li className='flex items-center gap-2 justify-between px-6 py-4 hover:bg-gray-900 cursor-pointer'>
                    <Link
                      href="/contact"
                      className="text-white text-md flex-1"
                      onClick={toggleSidebar}
                    >
                      CONTACT US
                    </Link>
                    <LuChevronRight className="inline-block ml-2 text-white" size={20}/>
                  </li>
                </ul>
                {/* Social Icons Row (placeholder, add icons as needed) */}
                <div className="flex justify-center gap-8 py-4 border-t border-gray-700 mt-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <span className="text-white text-2xl">
                      <FaInstagram />
                    </span>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <span className="text-white text-2xl">
                      <FaYoutube />
                    </span>
                  </a>
                  <a href="mailto:yourmail@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Gmail">
                    <span className="text-white text-2xl">
                      <FaGoogle />
                    </span>
                  </a>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;