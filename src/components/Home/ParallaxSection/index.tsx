"use client"
import { useEffect, useRef } from "react";

const ParallaxSection = () => {
    const parallaxRef = useRef<HTMLDivElement>(null);

  

    return (
    //     <section className="parallaxbg py-20 md:py-12 lg:py-16 bg-gray-50 relative bg-fixed  bg-center mt-5" 
    //   style={{
    //     backgroundImage: `url('/Images/dubaimuseum.jpg')`,
    //     backgroundSize: 'auto 100%',
    //     backgroundAttachment: 'fixed',
    //     backgroundPosition: 'center',
    //   }}
    //  ></section>
        <div className="relative  h-full overflow-hidden bg-fixed  bg-center  py-20">
            {/* Fixed Background Image */}
            <div 
                ref={parallaxRef}
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ 
                    backgroundImage: "url('/home/image2.jpeg')",
                    backgroundSize: 'auto 100%',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                }}
            />
            
            {/* Content that scrolls over the fixed background */}
            <div className="relative z-10  flex flex-col items-center justify-center text-white text-center px-4">
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg mb-6 opacity-90 font-light tracking-wide">
                        DISCOVER OUR COLLECTION
                    </p>
                    <h2 className="text-6xl md:text-8xl font-serif mb-8 leading-tight">
                        TIMELESS
                    </h2>
                    <h3 className="text-5xl md:text-7xl font-serif mb-12 leading-tight">
                        ELEGANCE
                    </h3>
                    <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
                        Experience the perfect blend of style and comfort with our curated collection
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button className="px-12 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-100 transition duration-300 text-lg">
                            Shop Now
                        </button>
                      
                    </div>
                </div>
            </div>
            
            {/* Additional scrollable content to demonstrate the effect */}
        
        </div>
    );
};

export default ParallaxSection; 