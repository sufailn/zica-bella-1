import Image from "next/image";
import { FaInstagram, FaYoutube, FaGoogle } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-8 pb-4 px-4">
            {/* Top Row: Logo/Brand and Social Icons */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <Image 
                        src="/logo-white.png"
                        alt="Logo"
                        width={36}
                        height={36}
                        className="h-9 w-auto"
                    />
                    <span className="text-lg font-rocaston font-semibold tracking-wide">ZICA BELLA</span>
                </div>
                <div className="flex space-x-4 text-lg">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
                    <a href="mailto:yourmail@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Gmail"><FaGoogle /></a>
                </div>
            </div>

            {/* Middle Row: Two Columns of Links, always side by side with vertical border */}
            <div className="flex flex-row border-t border-b border-gray-700 divide-x divide-gray-700 mb-8">
                <div className="flex-1 py-6 px-4">
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:underline">About Us</a></li>
                        <li><a href="#" className="hover:underline">Size Guide</a></li>
                        <li><a href="#" className="hover:underline">Shipping & Return</a></li>
                        <li><a href="#" className="hover:underline">Stockist</a></li>
                    </ul>
                </div>
                <div className="flex-1 py-6 px-4">
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:underline">Concept Store</a></li>
                        <li><a href="#" className="hover:underline">Press</a></li>
                        <li><a href="#" className="hover:underline">Careers</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Row: Policy Links */}
            <div className="flex flex-col md:flex-row items-center justify-between text-gray-300 text-sm gap-3">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Terms Of Use</a>
                <a href="#" className="hover:underline">Contact Us</a>
            </div>
        </footer>
    );
}

export default Footer;