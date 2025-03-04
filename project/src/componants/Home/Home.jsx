import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Laptop,
  Smartphone,
  Camera,
  Headphones,
  Watch,
  Tv,
  GamepadIcon,
  Speaker,
} from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  where,
  getDocs,
  query as firestoreQuery,
} from "firebase/firestore";
import "./Home.css";

const Home = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");
  const [cartItems, setCartItems] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const cartRef = collection(db, "users", userId, "cart");
        try {
          const cartSnapshot = await getDocs(cartRef);
          const cartIds = new Set(
            cartSnapshot.docs.map((doc) => doc.data().productId)
          );
          console.log("Fetched cart items:", cartIds);
          setCartItems(cartIds);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
      } else {
        console.log("No user authenticated during fetchCartItems");
      }
    };
    fetchCartItems();
  }, []);

  const suggestions = [
    { keyword: "Laptops", icon: Laptop },
    { keyword: "Phones", icon: Smartphone },
    { keyword: "Cameras", icon: Camera },
    { keyword: "Headphones", icon: Headphones },
    { keyword: "Smartwatch", icon: Watch },
    { keyword: "Television", icon: Tv },
    { keyword: "Gaming", icon: GamepadIcon },
    { keyword: "Speakers", icon: Speaker },
  ];

  const fetchProducts = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/products/?q=${query}`
      );
      const data = await response.json();
      setProducts(data);
      setShowProducts(true);
      console.log("Fetched products:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setQuery(event.target.value);
    if (event.target.value === "") {
      setShowProducts(false);
      setProducts([]);
    }
  };

  const handleKeyword = (keyword) => {
    setQuery(keyword);
    setShowProducts(true);
    fetchProducts();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleSearchClick = () => {
    if (query.trim().length > 0) {
      setShowProducts(true);
      fetchProducts();
    }
  };

  const handleSort = (event) => {
    const order = event.target.value;
    setSortOrder(order);

    const sortedProducts = [...products].sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ""));
      const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ""));
      if (order === "lowToHigh") {
        return priceA - priceB;
      } else if (order === "highToLow") {
        return priceB - priceA;
      }
      return 0;
    });
    setProducts(sortedProducts);
  };

  const toggleCart = async (product) => {
    if (!product?.id) {
      // Generate a unique ID using buy_url or name (if buy_url isn't available)
      product.id = product.buy_url ? product.buy_url.split("?")[0] : product.name.replace(/\s+/g, "-").toLowerCase();
      console.warn("Generated product ID:", product.id);
    }
  
    const user = auth.currentUser;
    if (!user) {
      console.log("User not authenticated");
      return;
    }
  
    const userId = user.uid;
    const cartRef = collection(db, "users", userId, "cart");
    const isInCart = cartItems.has(product.id);
  
    // Optimistic UI update
    setCartItems((prev) => {
      const newCart = new Set(prev);
      isInCart ? newCart.delete(product.id) : newCart.add(product.id);
      return newCart;
    });
  
    try {
      if (isInCart) {
        const cartQuery = firestoreQuery(cartRef, where("productId", "==", product.id));
        const cartSnapshot = await getDocs(cartQuery);
        
        cartSnapshot.forEach(async (docItem) => {
          await deleteDoc(doc(db, "users", userId, "cart", docItem.id));
        });
      } else {
        await addDoc(cartRef, {
          productId: product.id,
          imgUrl: product.image,
          title: product.name,
          price: product.price,
          buyUrl: product.buy_url,
        });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };
  
  

  const shouldShowSuggestions = query === "" && !loading && !showProducts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar container */}
      <div
        className={`w-full ${
          !showProducts
            ? "h-[calc(100vh-144px)] md:h-[calc(100vh-72px)]"
            : "h-24"
        } flex flex-col items-center justify-center fixed top-[72px] left-0 right-0 bg-white/80 backdrop-blur-md z-40 transition-all duration-300 px-4`}
      >
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search products..."
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <button
            onClick={handleSearchClick}
            className="absolute right-2 top-2 p-2 text-gray-600 hover:text-gray-800"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>
        {shouldShowSuggestions && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleKeyword(suggestion.keyword)}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100"
                >
                  <Icon size={16} />
                  <span>{suggestion.keyword}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* Content area */}
      <div
        className={`w-full max-w-6xl mx-auto ${
          showProducts ? "pt-32" : ""
        } pb-24 md:pb-8`}
      >
        {showProducts && products.length > 0 && (
          <div className="px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <select
                value={sortOrder}
                onChange={handleSort}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="default">Default Sorting</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product, index) => {
                const { image, name, price, buy_url } = product;
                const inCart = cartItems.has(product.id);
                return (
                  <div
                    key={product.id || index}
                    className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg relative"
                  >
                    {image && (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-48 object-contain "
                      />
                    )}
                    <div className="p-4 flex flex-col">
                      <h3 className="text-lg font-medium mb-2">{name}</h3>
                      <p className="text-gray-700 font-semibold">{price}</p>
                      <div className="flex justify-end mt-2">
                        <a
                          href={buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg text-center transition-colors duration-300 hover:bg-gray-800 active:bg-gray-950"
                          aria-label={`View details for ${name}`}
                        >
                          View Details
                        </a>
                        <button
                          onClick={() => toggleCart(product)}
                          className={`p-2.5 rounded ml-2 transition-colors duration-300 border ${
                            inCart
                              ? "border-gray-900 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-800"
                              : "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                          
                        >
                          <ShoppingCart
                            size={18}
                            className={`transition-colors duration-300 ${
                              inCart ? "stroke-white" : "stroke-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
