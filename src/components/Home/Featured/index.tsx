import Image from "next/image";

const featured = [
  {
    id: 1,
    title: "New Collection",
    image: "/home/image1.jpeg",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, molestias eos iste accusantium impedit commodi blanditiis amet. Minima, officia cumque?",
  },
  {
    id: 2,
    title: "New Collection",
    image: "/home/image2.jpeg",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, molestias eos iste accusantium impedit commodi blanditiis amet. Minima, officia cumque?",
  },
];

const Featured = () => {
    return (
        <section className="flex flex-col items-center justify-center px-2  mt-10 gap-6">
          {featured.map((item) => (
           <div key={item.id} className="flex flex-col items-center justify-center gap-16">
             <p className="text-[20px] text-center mb-4 font-light">
            {item.description}
            </p>
            <div className="relative w-full flex justify-center items-center">
            <Image
                src={item.image}
                alt="Featured cover"
                width={1200}
                height={600}
                style={{ width: '100%', height: '500px', objectFit: 'cover' }}
                loading="lazy"
            />
            <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-white px-6 py-3 rounded  transition text-center"
            >
              <h2>{item.title}</h2>
              <p className="text-sm underline leading-1 mt-2">Explore</p>
            </div>
            </div>
           </div>
          ))}
        </section>
    );
    }

export default Featured;