import React, { useEffect, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const s = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .cart-root { min-height: 100vh; background: #f5f4f0; font-family: 'DM Sans',sans-serif; padding: 32px 24px 100px; }
  .cart-inner { max-width: 760px; margin: 0 auto; }
  .cart-header { margin-bottom: 32px; }
  .cart-title { font-size: 28px; font-weight: 300; letter-spacing: -0.03em; color: #1a1a1a; margin: 0 0 4px; }
  .cart-sub { font-size: 13px; color: #888; font-weight: 400; }
  .cart-list { display: flex; flex-direction: column; gap: 12px; }
  .cart-item {
    display: flex; align-items: center; gap: 16px;
    background: #fff; border: 1px solid rgba(0,0,0,0.07);
    border-radius: 16px; padding: 16px; transition: box-shadow 0.2s ease;
  }
  .cart-item:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .cart-item-img {
    width: 72px; height: 72px; border-radius: 10px;
    object-fit: contain; background: #f5f4f0; flex-shrink: 0;
  }
  .cart-item-img-placeholder {
    width: 72px; height: 72px; border-radius: 10px;
    background: #f0efe9; display: flex; align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0;
  }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-name {
    font-size: 14px; font-weight: 400; color: #1a1a1a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
  }
  .cart-item-price { font-size: 15px; font-weight: 500; color: #1a1a1a; letter-spacing: -0.02em; }
  .cart-item-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .cart-btn {
    width: 36px; height: 36px; border-radius: 9px; border: 1px solid rgba(0,0,0,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: transparent; transition: all 0.15s ease;
    color: #888; text-decoration: none;
  }
  .cart-btn:hover { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
  .cart-btn.danger:hover { background: #c0392b; border-color: #c0392b; }
  .cart-footer {
    margin-top: 28px; padding: 24px; background: #fff;
    border: 1px solid rgba(0,0,0,0.07); border-radius: 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .cart-total-label { font-size: 13px; color: #888; margin-bottom: 2px; }
  .cart-total-val { font-size: 24px; font-weight: 500; letter-spacing: -0.03em; color: #1a1a1a; }
  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 12px; }
  .cart-empty-icon { font-size: 48px; opacity: 0.18; }
  .cart-empty-text { font-size: 15px; color: #aaa; font-weight: 400; }
`;

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState("0.00");

  useEffect(() => {
    const fetchCart = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(collection(db, "users", user.uid, "cart")).catch(() => null);
      if (!snap) return;
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.title);
      setCartItems(items);
      calcTotal(items);
    };
    fetchCart();
  }, []);

  const calcTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      const n = parseFloat((item.price || "0").replace(/[^0-9.-]+/g, ""));
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
    setTotal(sum.toFixed(2));
  };

  const remove = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "cart", id)).catch(console.error);
    const updated = cartItems.filter(i => i.id !== id);
    setCartItems(updated);
    calcTotal(updated);
  };

  return (
    <>
      <style>{s}</style>
      <div className="cart-root">
        <div className="cart-inner">
          <div className="cart-header">
            <h1 className="cart-title">Your Cart</h1>
            <p className="cart-sub">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <p className="cart-empty-text">Nothing here yet</p>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    {item.imgUrl
                      ? <img src={item.imgUrl} alt={item.title} className="cart-item-img" />
                      : <div className="cart-item-img-placeholder">📦</div>
                    }
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.title}</p>
                      <p className="cart-item-price">{item.price}</p>
                    </div>
                    <div className="cart-item-actions">
                      <a href={item.buyUrl} target="_blank" rel="noopener noreferrer" className="cart-btn" title="Buy">
                        <ShoppingBag size={15} />
                      </a>
                      <button className="cart-btn danger" onClick={() => remove(item.id)} title="Remove">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-footer">
                <div>
                  <p className="cart-total-label">Total</p>
                  <p className="cart-total-val">₹{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <button style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                  Checkout <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}