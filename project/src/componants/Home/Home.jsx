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
  getDocs,
} from "firebase/firestore";
import { OrbitProgress } from "react-loading-indicators"; // Adjust the import based on your library
import "./Home.css";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");
  const [cartItems, setCartItems] = useState([]); // Changed from Set to Array to store complete cart items
  const inputRef = useRef(null);
  
  // Removed localStorage initialization
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const cartRef = collection(db, "users", userId, "cart");
        try {
          const cartSnapshot = await getDocs(cartRef);
          // Store full cart items data instead of just IDs
          const items = cartSnapshot.docs.map((doc) => ({
            id: doc.id, // Firestore document ID
            ...doc.data(),
          }));
          setCartItems(items);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
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
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setProducts(data);
      setShowProducts(true);
      // Removed localStorage.setItem for products
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    // Removed localStorage.setItem for query
    if (newQuery === "") {
      setShowProducts(false);
    }
  };

  const handleSearchClick = () => {
    if (query.trim().length > 0) {
      setShowProducts(true);
      fetchProducts();
    }
  };

  const handleKeyword = (keyword) => {
    setQuery(keyword);
    // Removed localStorage.setItem for query
    setShowProducts(true);
    fetchProducts();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearchClick();
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

  // Check if a product is in cart by name
  const isProductInCart = (productName) => {
    return cartItems.some((item) => item.title === productName);
  };

  const toggleCart = async (product) => {
    // Ensure product has a unique ID
    if (!product?.id) {
      product.id = product.buy_url
        ? product.buy_url.split("?")[0]
        : product.name.replace(/\s+/g, "-").toLowerCase();
    }

    const user = auth.currentUser;
    if (!user) {
      console.log("User not authenticated");
      return;
    }

    const userId = user.uid;
    const cartRef = collection(db, "users", userId, "cart");

    // Check if product is in cart by name
    const productInCart = cartItems.find((item) => item.title === product.name);
    const isInCart = !!productInCart;

    // Optimistic UI update
    if (isInCart) {
      // Remove from cart
      setCartItems((prev) =>
        prev.filter((item) => item.title !== product.name)
      );
    } else {
      // Add to cart
      const newCartItem = {
        productId: product.id,
        imgUrl: product.image,
        title: product.name,
        price: product.price,
        buyUrl: product.buy_url,
      };
      setCartItems((prev) => [...prev, newCartItem]);
    }

    try {
      if (isInCart) {
        // Delete the item from Firestore
        await deleteDoc(doc(db, "users", userId, "cart", productInCart.id));
      } else {
        // Add the item to Firestore
        const docRef = await addDoc(cartRef, {
          productId: product.id,
          imgUrl: product.image,
          title: product.name,
          price: product.price,
          buyUrl: product.buy_url,
        });

        // Update local state with the new Firestore document ID
        setCartItems((prev) =>
          prev.map((item) =>
            item.title === product.name ? { ...item, id: docRef.id } : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      // Revert optimistic update if operation failed
      fetchCartItems();
    }
  };
  const fetchCartItems = async () => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const cartRef = collection(db, "users", userId, "cart");
      try {
        const cartSnapshot = await getDocs(cartRef);
        // Store full cart items data instead of just IDs
        const items = cartSnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore document ID
          ...doc.data(),
        }));
        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
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
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleKeyword(suggestion.keyword)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition duration-200 ease-in-out"
                >
                  <Icon size={16} />
                  <span className="font-medium">{suggestion.keyword}</span>
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
        {loading && (
          <div className="flex justify-center items-center h-48">
            <OrbitProgress
              variant="dotted"
              color="#0395e3"
              size="medium"
              text=""
              textColor="#12b4ff"
            />
          </div>
        )}
        {showProducts && products.length > 0 && (
          <div className="px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="flex items-center">
                <select
                  value={sortOrder}
                  onChange={handleSort}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="default">Default Sorting</option>
                  <option value="highToLow">Price: High to Low</option>
                  <option value="lowToHigh">Price: Low to High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product, index) => {
                const { image, name, price, buy_url, source } = product;
                const inCart = isProductInCart(name);

                return (
                  <div
                    key={product.id || index}
                    className="bg-white rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 relative group overflow-hidden"
                  >
                    {image && (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-90"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {name.length > 50 ? `${name.slice(0, 50)}...` : name}
                      </h3>
                      <p className="text-xl font-semibold text-gray-900 mb-4">
                        {price}
                      </p>
                      <div className="flex justify-evenly items-center">
                        <a
                          href={buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition duration-300"
                          aria-label={`View details for ${name}`}
                        >
                          View Details
                        </a>
                        <button
                          onClick={() => toggleCart(product)}
                          className={`p-2 rounded-lg transition-colors duration-300 border-2 ${
                            inCart
                              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                              : "border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
                          }`}
                          aria-label={
                            inCart ? "Remove from cart" : "Add to cart"
                          }
                        >
                          <ShoppingCart
                            size={20}
                            className={`transition-colors duration-300 ${
                              inCart ? "stroke-white" : "stroke-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="mt-4 text-sm text-gray-500 italic">
                        Source: {source}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {showProducts && products.length === 0 && !loading && (
          <div className="flex justify-center items-center h-48">
            <p className="text-gray-600">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
