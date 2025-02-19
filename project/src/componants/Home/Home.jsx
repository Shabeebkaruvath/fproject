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
      <div className="w-full max-w-6xl mx-auto">
        {/* Search bar container */}
        <div className={`${!showProducts ? 'h-screen flex items-center justify-center' : 'fixed top-15 left-0 right-0 bg-white/80 backdrop-blur-md z-10 py-6 shadow-sm'}`}>
          <div className="max-w-4xl mx-auto px-4 w-full">
            <div className="relative w-full max-w-xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                className="w-full pl-6 pr-12 py-3.5 rounded-full border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 text-gray-700 placeholder-gray-400 bg-white transition-all duration-300 shadow-sm"
              />
              <button
                onClick={handleSearchClick}
                aria-label="Search"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className={`${showProducts ? 'pt-28' : ''} px-4`}>
          {loading && (
            <div className="text-lg text-gray-600 text-center">Searching...</div>
          )}

          {showProducts && products.length > 0 && (
            <div className="mb-8">
              <select
                value={sortOrder}
                onChange={handleSort}
                className="w-48 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none bg-white text-gray-700 shadow-sm transition-all duration-300"
              >
                <option value="default">Sort by Price</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
          )}

          {showProducts && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
            {products.map((product, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name.slice(0,8)}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => toggleFavorite(index)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                    >
                      <Heart
                        size={20}
                        className={`transition-colors duration-300 ${
                          favorites.has(index)
                            ? "fill-rose-500 stroke-rose-500"
                            : "stroke-gray-600 hover:stroke-rose-500"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => toggleCart(index)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                    >
                      <ShoppingCart
                        size={20}
                        className={`transition-colors duration-300 ${
                          cartItems.has(index)
                            ? "stroke-blue-500"
                            : "stroke-gray-600 hover:stroke-blue-500"
                        }`}
                      />
                    </button>
                  </div>
                </div>
          
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 font-medium">
                    {product.price}
                  </p>
                  <a
                    href={product.buy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg text-center transition-colors duration-300 hover:bg-gray-800"
                  >
                    View Details
                  </a>
                </div>
          
                {/* Log the image URL to the console */}
                {console.log(product.image)}
              </div>
            ))}
          </div>
          
          ) : (
            showProducts && (
              <div className="text-center text-lg text-gray-600">
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