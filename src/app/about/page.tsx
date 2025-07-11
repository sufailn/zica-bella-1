"use client";
import React from 'react';
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar isHome={false} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-wider">
              About Zica Bella
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Where style meets substance, and every piece tells a story of elegance, comfort, and timeless fashion.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-wide">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  Founded in 2020, Zica Bella emerged from a simple yet powerful vision: to create clothing that empowers individuals to express their authentic selves while maintaining the highest standards of quality and comfort.
                </p>
                <p>
                  Our name "Zica Bella" translates to "beautiful elegance" - a philosophy that guides every design decision we make. We believe that fashion should be accessible, sustainable, and meaningful.
                </p>
                <p>
                  From our humble beginnings as a small design studio to becoming a trusted name in contemporary fashion, we've remained committed to our core values of authenticity, quality, and innovation.
                </p>
              </div>
            </div>
            <div className="aspect-[4/5] bg-gray-800 overflow-hidden">
              <img 
                src="/home/image1.jpeg" 
                alt="Zica Bella Story" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/shop/image1.jpeg";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                To create exceptional clothing that combines contemporary design with timeless appeal, 
                ensuring every customer feels confident, comfortable, and authentically themselves.
              </p>
            </div>
            <div className="text-center p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To be the leading destination for conscious fashion lovers who value quality, 
                sustainability, and style that transcends trends and seasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase tracking-wide">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">Quality</h3>
              <p className="text-gray-300">
                We use only premium materials and meticulous craftsmanship to ensure every piece meets our exacting standards.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">Sustainability</h3>
              <p className="text-gray-300">
                Environmental responsibility guides our production processes, from eco-friendly materials to ethical manufacturing.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">Inclusivity</h3>
              <p className="text-gray-300">
                Fashion is for everyone. We create diverse collections that celebrate all body types, styles, and expressions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase tracking-wide">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="aspect-square bg-gray-800 mb-4 overflow-hidden">
                <img 
                  src="/home/hero.jpg" 
                  alt="Sarah Mitchell - Founder & Creative Director" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/shop/image2.jpeg";
                  }}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Sarah Mitchell</h3>
              <p className="text-gray-400 mb-3">Founder & Creative Director</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                With over 15 years in fashion design, Sarah brings her passion for sustainable luxury to every Zica Bella collection.
              </p>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-800 mb-4 overflow-hidden">
                <img 
                  src="/home/image2.jpeg" 
                  alt="Marcus Chen - Lead Designer" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/shop/image3.jpeg";
                  }}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Marcus Chen</h3>
              <p className="text-gray-400 mb-3">Lead Designer</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Marcus's innovative approach to contemporary design has shaped Zica Bella's distinctive aesthetic and modern appeal.
              </p>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-800 mb-4 overflow-hidden">
                <img 
                  src="/home/image2.jpeg" 
                  alt="Elena Rodriguez - Operations Director" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/shop/image4.jpeg";
                  }}
                />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Elena Rodriguez</h3>
              <p className="text-gray-400 mb-3">Operations Director</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Elena ensures our commitment to quality and sustainability is maintained throughout our entire supply chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/5] bg-gray-800 overflow-hidden order-2 lg:order-1">
              <img 
                src="/home/image1.jpeg" 
                alt="Sustainable Fashion" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/shop/image5.jpeg";
                }}
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-wide">
                Sustainable Future
              </h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  At Zica Bella, sustainability isn't just a buzzword—it's the foundation of everything we do. We're committed to reducing our environmental impact while creating beautiful, lasting garments.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-white font-bold mr-3">•</span>
                    <span>Organic and recycled materials in 80% of our collections</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white font-bold mr-3">•</span>
                    <span>Carbon-neutral shipping and packaging</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white font-bold mr-3">•</span>
                    <span>Ethical manufacturing partnerships worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white font-bold mr-3">•</span>
                    <span>Circular fashion initiatives and recycling programs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-gray-400 uppercase tracking-wide">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
              <div className="text-gray-400 uppercase tracking-wide">Unique Designs</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-gray-400 uppercase tracking-wide">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">4.8★</div>
              <div className="text-gray-400 uppercase tracking-wide">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-wide">
            Join Our Journey
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Discover fashion that makes a statement, tells your story, and contributes to a better world. 
            Explore our latest collections and become part of the Zica Bella community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop" 
              className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors"
            >
              Shop Collection
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage; 