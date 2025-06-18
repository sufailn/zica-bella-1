import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import Featured from "@/components/Home/Featured";
import Hero from "@/components/Home/Hero";
import CategorySection from "@/components/Home/ProductSection";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Navbar isHome={true} />
    <div className="font-literata text-2xl ">
      <Hero />
      {/* <CategorySection /> */}
      <Featured />
      <Footer />
    </div>
    </>
  );
}

