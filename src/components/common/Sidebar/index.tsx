"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CiMenuFries } from "react-icons/ci";
import { IoClose } from 'react-icons/io5';
import { LuChevronRight } from 'react-icons/lu';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const backdropVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 },
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-2 rounded-md  ${!isOpen ? 'text-white': 'hidden'}`}
      >
        <CiMenuFries size={24} />
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
              className="fixed top-0 left-0 h-full w-full   shadow-lg z-40 flex flex-col p-4 " 
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
           <div className='bg-white h-full w-full rounded-lg overflow-hidden'>
               {/* Close Button */}
              <div className="p-4 hover:bg-gray-100 text-gray-800 flex items-center justify-between border-b border-gray-200">
                <div
                  onClick={toggleSidebar}
                  className="rounded-md flex items-center gap-2 cursor-pointer"
                >
                  <IoClose  size={24} className=''/>
                  <p>Close</p>
                </div>
              </div>

              {/* Sidebar Items */}
              <nav className="flex-1 p-4">
                <ul className="space-y-4">
                  <li className='flex items-center gap-2 justify-between'>
                    <a
                      href="#"
                      className="text-gray-800 hover:text-blue-600 text-lg"
                    >
                      Shirts
                    </a>
                    <LuChevronRight className="inline-block ml-2 text-gray-500" size={22}/>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-800 hover:text-blue-600 text-lg"
                    >
                      T-Shirts
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-800 hover:text-blue-600 text-lg"
                    >
                      Hoodies
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-800 hover:text-blue-600 text-lg"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
           </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;