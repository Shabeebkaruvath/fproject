import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, ShoppingCart, Laptop, Smartphone, Camera, Headphones, Watch, Tv, Gamepad2, Speaker } from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import { collection, addDoc, doc, deleteDoc, getDocs } from "firebase/firestore";
import "./Home.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const SUGGESTIONS = [
  { keyword: "Laptops", icon: Laptop },
  { keyword: "Phones", icon: Smartphone },
  { keyword: "Cameras", icon: Camera },
  { keyword: "Headphones", icon: Headphones },
  { keyword: "Smartwatch", icon: Watch },
  { keyword: "Television", icon: Tv },
  { keyword: "Gaming", icon: Gamepad2 },
  { keyword: "Speakers", icon: Speaker },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");
  const [cartItems, setCartItems] = useState([]);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const inputRef = useRef(null);

  const fetchCartItems = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "cart"));
      setCartItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.title));
    } catch (e) {
      console.error("Cart fetch error:", e);
    }
  }, []);

  useEffect(() => { fetchCartItems(); }, [fetchCartItems]);

  const fetchProducts = async (q) => {
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results || []);
      setProducts(list);
      setShowProducts(true);
    } catch (e) {
      console.error("Fetch error:", e);
      setProducts([]);
      setShowProducts(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (e) => {
    const order = e.target.value;
    setSortOrder(order);
    const sorted = [...products].sort((a, b) => {
      const pa = parseFloat((a.price || "0").replace(/[^0-9.-]+/g, ""));
      const pb = parseFloat((b.price || "0").replace(/[^0-9.-]+/g, ""));
      if (order === "lowToHigh") return pa - pb;
      if (order === "highToLow") return pb - pa;
      return 0;
    });
    setProducts(sorted);
  };

  const toggleCart = async (product) => {
    const user = auth.currentUser;
    if (!user) return;
    const inCartItem = cartItems.find(i => i.title === product.name);
    if (inCartItem) {
      setCartItems(prev => prev.filter(i => i.title !== product.name));
      try { await deleteDoc(doc(db, "users", user.uid, "cart", inCartItem.id)); }
      catch (e) { fetchCartItems(); }
    } else {
      const newItem = { productId: product.id || product.name, imgUrl: product.image, title: product.name, price: product.price, buyUrl: product.buy_url };
      setCartItems(prev => [...prev, newItem]);
      try {
        const ref = await addDoc(collection(db, "users", user.uid, "cart"), newItem);
        setCartItems(prev => prev.map(i => i.title === product.name ? { ...i, id: ref.id } : i));
      } catch (e) { fetchCartItems(); }
    }
  };

  const compact = showProducts || loading;

  return (
    <div className="sn-root">
      <div className={`sn-hero ${compact ? "compact" : "expanded"}`}>
        <div className="sn-hero-inner">
          {!compact && <p className="sn-eyebrow">ShopNest — Find anything</p>}
          {!compact && (
            <h1 className="sn-headline">
              What are you<br />looking for?
            </h1>
          )}
          <div className="sn-search-wrap">
            <input
              ref={inputRef}
              type="text"
              className="sn-search-input"
              placeholder="Search products…"
              value={query}
              onChange={e => { setQuery(e.target.value); if (!e.target.value) setShowProducts(false); }}
              onKeyDown={e => e.key === "Enter" && fetchProducts(query.trim())}
            />
            <button className="sn-search-btn" onClick={() => fetchProducts(query.trim())} aria-label="Search">
              <Search size={15} strokeWidth={2.2} />
            </button>
          </div>
          {!compact && (
            <div className="sn-chips">
              {SUGGESTIONS.map(({ keyword, icon: Icon }) => (
                <button key={keyword} className="sn-chip" onClick={() => { setQuery(keyword); fetchProducts(keyword); }}>
                  <Icon size={14} strokeWidth={1.8} />
                  {keyword}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`sn-content ${compact ? "with-results" : "without-results"}`}>
        {loading && (
          <div className="sn-loader">
            <div className="sn-loader-dots">
              <div className="sn-loader-dot" />
              <div className="sn-loader-dot" />
              <div className="sn-loader-dot" />
            </div>
            <p className="sn-loader-text">Searching across the web…</p>
          </div>
        )}

        {showProducts && !loading && (
          <>
            <div className="sn-toolbar">
              <span className="sn-result-count">{products.length} results for "{query}"</span>
              <select className="sn-sort" value={sortOrder} onChange={handleSort}>
                <option value="default">Relevance</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="sn-empty">
                <div className="sn-empty-icon">∅</div>
                <p className="sn-empty-text">No products found. Try a different search.</p>
              </div>
            ) : (
              <div className="sn-grid">
                {products.map((product, i) => {
                  const inCart = cartItems.some(c => c.title === product.name);
                  return (
                    <div className="sn-card" key={product.id || i}>
                      <div className="sn-card-img-wrap">
                        {product.image
                          ? <img src={product.image} alt={product.name} className="sn-card-img" loading="lazy" />
                          : <span style={{ fontSize: 32, opacity: 0.15 }}>📦</span>
                        }
                      </div>
                      <div className="sn-card-body">
                        <p className="sn-card-name">{product.name}</p>
                        <p className="sn-card-source">{product.source}</p>
                        <div className="sn-card-footer">
                          <span className="sn-card-price">{product.price}</span>
                          <div className="sn-card-actions">
                            <a href={product.buy_url} target="_blank" rel="noopener noreferrer" className="sn-btn-view">View</a>
                            <button className={`sn-btn-cart ${inCart ? "in-cart" : ""}`} onClick={() => toggleCart(product)} aria-label={inCart ? "Remove from cart" : "Add to cart"}>
                              <ShoppingCart size={14} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}