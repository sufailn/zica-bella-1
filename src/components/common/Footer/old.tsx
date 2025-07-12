import Image from "next/image";


const Footer = () => {
    return (
        <footer className="p-6 pt-0 text-white bg-black">
	<div className=" flex flex-col items-start justify-between space-y-8 ">
            <hr className="w-full"/>

        <div className="flex items-center space-x-4">
            <Image 
                src="/logo-white.png"
                alt="Logo"
                width={100}
                height={50}
                className="h-12 w-auto "
            />
            <h2 className="font-rocaston">ZICA BELLA</h2>
        </div>

		<div className="flex flex-col space-y-4 w-full">
			<hr className="w-full"/>
			<div className="flex flex-col space-y-2 text-sm ">
                <a rel="noopener noreferrer" href="#">About Us</a>
                <a rel="noopener noreferrer" href="#">Size Guide</a>
                <a rel="noopener noreferrer" href="#">Shipping & Returns</a>
                <a rel="noopener noreferrer" href="#">Stockist</a>
                <a rel="noopener noreferrer" href="#">Concept Store</a>
                <a rel="noopener noreferrer" href="#">Press</a>
                <a rel="noopener noreferrer" href="#">Careers</a>
              
			</div>
		</div>
		<div className="flex flex-col space-y-4 w-full">
			<hr className="w-full"/>
			<div className="flex flex-col space-y-2 text-sm ">
               <a rel="noopener noreferrer" href="#">Privacy Policy</a>
                <a rel="noopener noreferrer" href="#">Terms of Use</a>
                <a rel="noopener noreferrer" href="#">Contact Us</a>
				
			</div>
		</div>
		<div className="flex flex-col space-y-4 w-full">
			<hr className="w-full"/>
			<div className="flex flex-col space-y-2 text-sm ">
                <a rel="noopener noreferrer" href="#">Instagram</a>
                <a rel="noopener noreferrer" href="#">YouTube</a>
                <a rel="noopener noreferrer" href="#">Email</a>
				
			</div>
		</div>
	
		
	</div>
	<div className="flex items-center justify-center px-6 pt-12 text-sm">
		<span className="">© Copyright 2025. All Rights Reserved.</span>
	</div>
</footer>
    );
    }

export default Footer;