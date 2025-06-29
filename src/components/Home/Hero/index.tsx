"use client"
import Link from "next/link";

const Hero = () => {
    return (
        <div className="relative h-[700px] overflow-hidden">
            {/* Background image that shows until video loads */}
            <div 
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/home/hero.jpg')" }}
            />
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                poster="/home/hero.jpg"
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src="/home/hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-opacity-40"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
                <p className="text-lg mb-2 opacity-65">zica bella</p>
                <h3 className="text-4xl font-serif mb-4">Unleash Your Style: Discover the Latest Trends!</h3>
                <Link href="/shop" className="px-6 py-2 bg-white text-black rounded-sm font-bold uppercase hover:bg-gray-200 transition">
                    view product
                </Link>
            </div>
        </div>
    );
}

export default Hero;