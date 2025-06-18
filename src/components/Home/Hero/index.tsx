import Image from "next/image"
import Link from "next/link";


const Hero = () => {
    return(

        <div>
       
            <div className=" inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-30 bg-[url('/home/hero.jpg')] bg-cover bg-center h-[700px]">
                <p className="text-lg mb-2 text-center">Dioriviera</p>
                <h3 className="text-3xl font-bold mb-4 text-center">An Invitation to Venture Away</h3>
                <Link href="/products" className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition text-center">
                    Discover
                </Link>
            </div>
    </div>
        )
}

export default Hero;