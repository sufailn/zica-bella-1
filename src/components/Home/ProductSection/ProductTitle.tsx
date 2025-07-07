

const ProductTitle = () => {
  return (
    <div className="mb-8 md:mb-12 px-4">
      <div className="relative ">
        {/* Dotted border overlay */}
        
        {/* Content */}
        <div className="relative flex items-end  justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              NEW<br />
              COLLECTION
            </h1>
          </div>
          
          <div className="text-left sm:text-right">
            <p className="text-base sm:text-lg md:text-xl font-medium text-white  tracking-widest font-numbers">
              SUMMER<br />
              2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductTitle;