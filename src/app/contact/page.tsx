"use client"
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Accordion from '@/components/common/Accordion';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
    <Navbar isHome={false} />
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-12 px-2">
        {/* Header Section */}
        <section className="w-full max-w-xl text-center mb-10 mt-10">
          <h1 className="text-3xl  mb-3 tracking-tight">Contact</h1>
          <p className="text-sm text-gray-600 mb-1">
            Dior Client Service Center is available Monday to Sunday from 11am to 7:30pm (IST).<br />
            Our Client Advisors will be delighted to assist you and provide personalized advice.
          </p>
        </section>

        {/* Accordions */}
        <section className="w-full max-w-xl  mb-8 divide-y">
          <Accordion title="Call us">
            <div>
              <p className="text-base font-medium text-blue-700 mb-1">+91 8000503392</p>
              <p className="text-gray-500 text-sm">Service available Monday to Sunday from 11am to 7:30pm (IST).</p>
            </div>
          </Accordion>
          <Accordion title="In-Store Appointment">
            <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">Book An Appointment</button>
          </Accordion>
          <Accordion title="Frequently Asked Questions">
            <ul className="space-y-2 text-left text-sm">
              <li><span className="font-medium">ABOUT THE SITE:</span> Learn more about our services and how to use our website.</li>
              <li><span className="font-medium">THE SELECTION:</span> Discover our curated collections for every occasion.</li>
              <li><span className="font-medium">CLIENT SERVICE CENTER:</span> Our advisors are here to help you with any questions.</li>
            </ul>
          </Accordion>
          <Accordion title="Write us">
            <p className="text-sm text-gray-600">For any inquiries, please use the form on our website or email us at <a href="mailto:contact@dior.com" className="underline">contact@dior.com</a>.</p>
          </Accordion>
        </section>

        {/* Discover More Section */}
        <section className="w-full max-w-xl mb-8">
          <h2 className="text-lg  text-center mb-4">Discover More</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Link href="#" className="flex flex-col items-center">
              <div className="w-full aspect-[4/3] relative mb-2 rounded overflow-hidden">
                <Image src="/contact/image1.jpeg" alt="Women's Fashion" fill style={{objectFit:'cover'}} />
              </div>
              <span className="text-xs mt-1 border-b border-gray-400">Women's Fashion</span>
            </Link>
            <Link href="#" className="flex flex-col items-center">
              <div className="w-full aspect-[4/3] relative mb-2 rounded overflow-hidden">
                <Image src="/contact/image4.jpeg" alt="Men's Fashion" fill style={{objectFit:'cover'}} />
              </div>
              <span className="text-xs mt-1 border-b border-gray-400">Men's Fashion</span>
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] relative mb-2 rounded overflow-hidden max-w-xs mx-auto">
              <Image src="/contact/image2.jpeg" alt="Baby" fill style={{objectFit:'cover'}} />
            </div>
            <span className="text-xs mt-1 border-b border-gray-400">Baby</span>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="w-full max-w-xl bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-base  mb-3 text-center">Inspire me with all the latest Dior news</h2>
          <form className="flex flex-col gap-3 items-center">
            <input type="email" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black" placeholder="* E-mail" />
            <button type="submit" className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition">Confirm</button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
    </>
  );
} 