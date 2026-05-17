import React, { useState, useEffect } from "react";
import { ShoppingCart, LogOut, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const s = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .prof-root { min-height: 100vh; background: #f5f4f0; font-family: 'DM Sans',sans-serif; display: flex; align-items: center; justify-content: center; padding: 32px 24px; }
  .prof-card { background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 24px; width: 100%; max-width: 380px; overflow: hidden; }
  .prof-top { padding: 32px 28px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .prof-avatar { width: 56px; height: 56px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 500; color: #fff; margin-bottom: 16px; letter-spacing: -0.02em; }
  .prof-name { font-size: 20px; font-weight: 500; color: #1a1a1a; letter-spacing: -0.02em; margin: 0 0 4px; }
  .prof-email { font-size: 13px; color: #888; font-weight: 400; margin: 0; }
  .prof-meta { padding: 0 28px 8px; }
  .prof-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 14px; }
  .prof-row:last-child { border-bottom: none; }
  .prof-row-label { color: #888; font-weight: 400; }
  .prof-row-val { color: #1a1a1a; font-weight: 400; }
  .prof-actions { padding: 8px 16px 20px; display: flex; flex-direction: column; gap: 8px; }
  .prof-btn {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 12px; font-family: 'DM Sans',sans-serif;
    font-size: 14px; font-weight: 400; text-decoration: none;
    border: 1px solid rgba(0,0,0,0.08); cursor: pointer;
    transition: all 0.15s ease; background: transparent; width: 100%; color: #1a1a1a;
  }
  .prof-btn:hover { background: #f5f4f0; }
  .prof-btn.logout { color: #c0392b; }
  .prof-btn-left { display: flex; align-items: center; gap: 10px; }
`;

const initials = (email) => email ? email.slice(0, 2).toUpperCase() : "??";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, u => { if (u) setUser(u); else navigate("/login"); });
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth).catch(console.error);
    navigate("/login");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const lastLogin = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
      <style>{s}</style>
      <div className="prof-root">
        <div className="prof-card">
          <div className="prof-top">
            <div className="prof-avatar">{user ? initials(user.email) : "…"}</div>
            <p className="prof-name">{displayName}</p>
            <p className="prof-email">{user?.email}</p>
          </div>
          <div className="prof-meta">
            {lastLogin && (
              <div className="prof-row">
                <span className="prof-row-label">Last login</span>
                <span className="prof-row-val">{lastLogin}</span>
              </div>
            )}
            <div className="prof-row">
              <span className="prof-row-label">Account</span>
              <span className="prof-row-val">Standard</span>
            </div>
          </div>
          <div className="prof-actions">
            <Link to="/cart" className="prof-btn">
              <span className="prof-btn-left"><ShoppingCart size={16} strokeWidth={1.8} /> Cart</span>
              <ChevronRight size={16} color="#ccc" />
            </Link>
            <button className="prof-btn logout" onClick={handleLogout}>
              <span className="prof-btn-left"><LogOut size={16} strokeWidth={1.8} /> Sign out</span>
              <ChevronRight size={16} color="#ecc" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}