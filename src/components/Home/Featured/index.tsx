import Image from "next/image";


const Featured = () => {
    return (
        <section className="flex flex-col items-center justify-center px-2  mt-10 gap-8">
           <div className="flex flex-col items-center justify-center gap-32">
             <p className="text-[20px] text-center mb-4 font-light">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, molestias eos iste accusantium impedit commodi blanditiis amet. Minima, officia cumque?
            </p>
            <div className="relative w-full flex justify-center items-center">
            <Image
                src="/home/image2.jpeg"
                alt="Featured cover"
                width={1200}
                height={600}
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
            />
            <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-white px-6 py-3 rounded  transition text-center"
            >
              <h2>New Collection</h2>
              <p className="text-sm">Explore</p>
            </div>
            </div>
           </div>
           <div className="flex flex-col items-center justify-center gap-32">
             <p className="text-[20px] text-center mb-4 font-light">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, molestias eos iste accusantium impedit commodi blanditiis amet. Minima, officia cumque?
            </p>
            <div className="relative w-full flex justify-center items-center">
            <Image
                src="/home/image1.jpeg"
                alt="Featured cover"
                width={1200}
                height={600}
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
            />
            <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-white px-6 py-3 rounded  transition text-center"
            >
              <h2>New Collection</h2>
              <p className="text-sm hover:underline transition-all">Explore</p>
            </div>
            </div>
           </div>
        </section>
    );
    }

export default Featured;