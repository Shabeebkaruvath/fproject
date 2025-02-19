import React, { useState, useRef } from "react";
import { Search, Heart, ShoppingCart } from "lucide-react";

const Home = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");
  const [favorites, setFavorites] = useState(new Set());
  const [cartItems, setCartItems] = useState(new Set());
  const inputRef = useRef(null);

  const fetchProducts = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/products/?q=${query}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setQuery(event.target.value);
    setShowProducts(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleSearchClick = () => {
    setShowProducts(query.trim().length > 0);
    fetchProducts();
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

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const toggleCart = (productId) => {
    setCartItems(prev => {
      const newCart = new Set(prev);
      if (newCart.has(productId)) {
        newCart.delete(productId);
      } else {
        newCart.add(productId);
      }
      return newCart;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar container - Positioned below navbar */}
      <div className={`w-full ${!showProducts ? 'h-[calc(100vh-144px)] md:h-[calc(100vh-72px)]' : 'h-24'} 
        flex items-center justify-center fixed top-[72px] left-0 right-0 
        bg-white/80 backdrop-blur-md z-40 transition-all duration-300`}>
        <div className="w-full max-w-xl mx-auto px-4">
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
        </div>
      </div>

      {/* Content area - Adjusted for navbar and bottom nav */}
      <div className={`w-full max-w-6xl mx-auto ${showProducts ? 'pt-32' : ''} pb-24 md:pb-8`}>
        <div className="px-4">
          {loading && (
            <div className="text-base text-gray-600 text-center">Searching...</div>
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

          {showProducts && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg touch-manipulation"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name.slice(0,8)}
                      className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => toggleFavorite(index)}
                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white touch-manipulation"
                      >
                        <Heart
                          size={18}
                          className={`transition-colors duration-300 ${
                            favorites.has(index)
                              ? "fill-rose-500 stroke-rose-500"
                              : "stroke-gray-600 hover:stroke-rose-500"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => toggleCart(index)}
                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white touch-manipulation"
                      >
                        <ShoppingCart
                          size={18}
                          className={`transition-colors duration-300 ${
                            cartItems.has(index)
                              ? "stroke-blue-500"
                              : "stroke-gray-600 hover:stroke-blue-500"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
            
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-3 font-medium">
                      {product.price}
                    </p>
                    <a
                      href={product.buy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg text-center transition-colors duration-300 hover:bg-gray-800 active:bg-gray-950 touch-manipulation"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            showProducts && (
              <div className="text-center text-base sm:text-lg text-gray-600">
                No products found
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;