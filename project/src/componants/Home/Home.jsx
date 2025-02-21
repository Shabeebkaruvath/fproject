import React, { useState, useRef } from "react";
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

const Home = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");

  const [cartItems, setCartItems] = useState(new Set());
  const inputRef = useRef(null);

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

  const toggleCart = (productId) => {
    setCartItems((prev) => {
      const newCart = new Set(prev);
      if (newCart.has(productId)) {
        newCart.delete(productId);
      } else {
        newCart.add(productId);
      }
      return newCart;
    });
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
        } 
        flex flex-col items-center justify-center fixed top-[72px] left-0 right-0 
        bg-white/80 backdrop-blur-md z-40 transition-all duration-300 px-4`}
      >
        <div className="w-full max-w-xl mx-auto">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 text-gray-700 placeholder-gray-400 bg-white transition-all duration-300 shadow-sm text-base"
            />
            <button
              onClick={handleSearchClick}
              aria-label="Search"
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 touch-manipulation"
            >
              <Search size={18} />
            </button>
          </div>
          <h3 className="text mt-4 underline text-gray-400 font-thin">
            Suggestions
          </h3>
          {/* Suggestions - Only shown when search is empty and not searching */}
          {shouldShowSuggestions && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto px-4">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleKeyword(item.keyword)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300 text-gray-700 hover:text-gray-900"
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.keyword}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div
        className={`w-full max-w-6xl mx-auto ${
          showProducts ? "pt-32" : ""
        } pb-24 md:pb-8`}
      >
        <div className="px-4">
          {loading && (
            <div className="text-base text-gray-600 text-center">
              Searching...
            </div>
          )}

          {showProducts && products.length > 0 && (
            <div className="mb-6 flex justify-between items-center">
              <select
                value={sortOrder}
                onChange={handleSort}
                className="w-full max-w-[180px] px-3 py-2 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none bg-white text-gray-700 shadow-sm transition-all duration-300 text-sm touch-manipulation"
              >
                <option value="default">Sort by Price</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
          )}

          {showProducts && products.length === 0 && !loading && (
            <div className="text-center text-lg text-gray-600">
              No products found
            </div>
          )}

          {showProducts && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product, index) => {
                const { image, name, price, buy_url } = product;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg relative"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <div className="w-full h-56 flex items-center justify-center">
                        <img
                          src={image}
                          alt={name}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null; // prevents looping
                            e.target.src = "path/to/placeholder-image.jpg"; // fallback image
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-4 flex flex-col">
                      <h3 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2">
                        {name}
                      </h3>
                      <p className="text-gray-600 mb-4 font-medium">{price}</p>
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
                          onClick={() => toggleCart(index)}
                          className="p-2.5 rounded ml-2 border-[#000] border-y-4 bg-white/90 backdrop-blur-sm transition-colors duration-300 hover:bg-white-200"
                          aria-label={
                            cartItems.has(index)
                              ? "Remove from cart"
                              : "Add to cart"
                          }
                        >
                          <ShoppingCart
                            size={18}
                            className={ ` transition-colors duration-300 ${
                              cartItems.has(index)
                                ? "stroke-blue-500"
                                : "stroke-gray-600 hover:stroke-blue-500"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
