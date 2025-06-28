export const products = [
  {
    id: "1",
    name: "AVOINE HOODED QUILTED JACKET",
    price: 1500,
    images: ["/shop/image1.jpeg", "/shop/image2.jpeg", "/shop/image4.jpeg", "/shop/image5.jpeg"],
    category: "JACKETS",
    colors: [
      { name: "Brown", value: "#8B4513", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "White", value: "#FFFFFF", available: false }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: false }
    ],
    description: "Premium quilted jacket with hood. Made from high-quality materials for ultimate comfort and style. Perfect for everyday wear.",
    soldOut: false
  },
  {
    id: "2",
    name: "PREMIUM QUILTED JACKET",
    price: 1600,
    images: ["/shop/image2.jpeg", "/shop/image3.jpeg", "/shop/image1.jpeg"],
    category: "JACKETS",
    colors: [
      { name: "Navy", value: "#1a365d", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "Gray", value: "#718096", available: true }
    ],
    sizes: [
      { name: "S", available: false },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    description: "Luxury quilted jacket with premium finish. Designed for those who appreciate fine craftsmanship and contemporary style.",
    soldOut: true
  },
  {
    id: "3",
    name: "CLASSIC BUTTON SHIRT",
    price: 800,
    images: ["/shop/image1.jpeg", "/shop/image2.jpeg"],
    category: "SHIRTS",
    colors: [
      { name: "White", value: "#FFFFFF", available: true },
      { name: "Blue", value: "#3182ce", available: true },
      { name: "Black", value: "#000000", available: false }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    description: "Timeless button-down shirt crafted from premium cotton. A wardrobe essential that pairs perfectly with any outfit.",
    soldOut: false
  },
  {
    id: "4",
    name: "OVERSIZED GRAPHIC TEE",
    price: 600,
    images: ["/shop/image2.jpeg", "/shop/image4.jpeg"],
    category: "SHIRTS",
    colors: [
      { name: "White", value: "#FFFFFF", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "Gray", value: "#718096", available: true }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: false },
      { name: "XL", available: true }
    ],
    description: "Comfortable oversized tee with unique graphic design. Made from soft cotton blend for all-day comfort.",
    soldOut: true
  },
  {
    id: "5",
    name: "SLIM FIT DENIM JEANS",
    price: 1200,
    images: ["/shop/image4.jpeg", "/shop/image5.jpeg"],
    category: "PANTS",
    colors: [
      { name: "Indigo", value: "#4c51bf", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "Light Blue", value: "#63b3ed", available: false }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: false }
    ],
    description: "Premium slim-fit denim jeans with contemporary styling. Crafted from durable denim with just the right amount of stretch.",
    soldOut: false
  },
  {
    id: "6",
    name: "CARGO SUMMER SHORTS",
    price: 700,
    images: ["/shop/image6.jpeg", "/shop/image3.jpeg"],
    category: "PANTS",
    colors: [
      { name: "Khaki", value: "#d69e2e", available: true },
      { name: "Black", value: "#000000", available: true },
      { name: "Olive", value: "#68d391", available: true }
    ],
    sizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true }
    ],
    description: "Functional cargo shorts perfect for summer adventures. Multiple pockets and comfortable fit for active lifestyles.",
    soldOut: false
  }
];

export const getProductById = (id: string) => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string) => {
  return category === 'VIEW ALL' ? products : products.filter(p => p.category === category);
};
