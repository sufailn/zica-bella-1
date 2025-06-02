import Image from "next/image";
import { CiMenuFries } from "react-icons/ci";
import { IoCartOutline } from "react-icons/io5";


const Navbar = () => {
    return (
        <nav className="flex items-center justify-between p-4 text-white h-20 bg-transparent fixed top-0 left-0 right-0 z-50">
        <div>
          <CiMenuFries className="text-3xl cursor-pointer" />
        </div>
        <div className="flex items-center justify-center w-full gap-2">
            <Image 
                src="/logo-white.png"
                alt="Logo"
                width={40}
                height={50}
                className="cursor-pointer"
            />
            <p>ZICA BELLA</p>
        </div>
        <div>
            <IoCartOutline className="text-3xl cursor-pointer" />
        </div>
        </nav>
    );
    }

export default Navbar;