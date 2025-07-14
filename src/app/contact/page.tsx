"use client"
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Accordion from '@/components/common/Accordion';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion'

export default function ContactPage() {
  return (
    <>
    <Navbar isHome={false} />
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-12 px-2">
        {/* Header Section */}
        <motion.section
          className="w-full max-w-xl text-center mb-10 mt-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl text-white mb-3 tracking-tight">Contact</h1>
          <p className="text-sm text-gray-300 mb-1">
            Dior Client Service Center is available Monday to Sunday from 11am to 7:30pm (IST).<br />
            Our Client Advisors will be delighted to assist you and provide personalized advice.
          </p>
        </motion.section>

        {/* Accordions */}
        <motion.section
          className="w-full max-w-xl mb-8 divide-y divide-gray-700 bg-gray-900 rounded-lg shadow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion title="Call us">
            <div>
              <p className="text-base font-medium text-blue-400 mb-1">+91 8000503392</p>
              <p className="text-gray-400 text-sm">Service available Monday to Sunday from 11am to 7:30pm (IST).</p>
            </div>
          </Accordion>
          <Accordion title="In-Store Appointment">
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Book An Appointment</button>
          </Accordion>
          <Accordion title="Frequently Asked Questions">
            <ul className="space-y-2 text-left text-sm text-gray-300">
              <li><span className="font-medium">ABOUT THE SITE:</span> Learn more about our services and how to use our website.</li>
              <li><span className="font-medium">THE SELECTION:</span> Discover our curated collections for every occasion.</li>
              <li><span className="font-medium">CLIENT SERVICE CENTER:</span> Our advisors are here to help you with any questions.</li>
            </ul>
          </Accordion>
          <Accordion title="Write us">
            <p className="text-sm text-gray-400">For any inquiries, please use the form on our website or email us at <a href="mailto:contact@dior.com" className="underline text-blue-400">contact@dior.com</a>.</p>
          </Accordion>
        </motion.section>

        {/* Discover More Section */}
        <motion.section
          className="w-full max-w-xl mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-lg text-gray-200 text-center mb-4">Discover More</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Link href="#" className="flex flex-col items-center">
              <div className="w-full aspect-[4/3] relative mb-2 rounded overflow-hidden bg-gray-800">
                <Image src="/contact/image1.jpeg" alt="Women's Fashion" fill style={{objectFit:'cover'}} />
              </div>
              <span className="text-xs mt-1 border-b border-gray-600 text-gray-300">Women's Fashion</span>
            </Link>
            <Link href="#" className="flex flex-col items-center">
              <div className="w-full aspect-[4/3] relative mb-2 rounded overflow-hidden bg-gray-800">
                <Image src="/contact/image4.jpeg" alt="Men's Fashion" fill style={{objectFit:'cover'}} />
              </div>
              <span className="text-xs mt-1 border-b border-gray-600 text-gray-300">Men's Fashion</span>
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] relative mb-2 rounded overflow-hidden max-w-xs mx-auto bg-gray-800">
              <Image src="/contact/image2.jpeg" alt="Baby" fill style={{objectFit:'cover'}} />
            </div>
            <span className="text-xs mt-1 border-b border-gray-600 text-gray-300">Baby</span>
          </div>
        </motion.section>

        {/* Newsletter Signup */}
        <motion.section
          className="w-full max-w-xl bg-gray-900 rounded-lg shadow p-6 mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-base text-gray-200 mb-3 text-center">Inspire me with all the latest Dior news</h2>
          <form className="flex flex-col gap-3 items-center">
            <input type="email" className="w-full border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400" placeholder="* E-mail" />
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Confirm</button>
          </form>
        </motion.section>
      </main>
      <Footer />
    </div>
    </>
  );
} 