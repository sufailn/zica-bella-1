import Image from "next/image"


const Hero = () => {
    return(

        <div>
        <Image
            src="/home/hero.jpg"
            alt="Hero Image"
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
            />
    </div>
        )
}

export default Hero;