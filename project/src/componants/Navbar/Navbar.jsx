import React from 'react';
import { Home, User, MessageCircle, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart' },
  { to: '/feedback', icon: MessageCircle, label: 'Feedback' },
];

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .sn-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    height: 64px;
    background: rgba(245,244,240,0.88);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-bottom: 1px solid rgba(0,0,0,0.07);
    display: flex; align-items: center;
    font-family: 'DM Sans', -apple-system, sans-serif;
  }
  .sn-nav-inner {
    max-width: 1200px; margin: 0 auto; width: 100%;
    padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .sn-logo {
    display: flex; align-items: center; gap: 6px;
    text-decoration: none;
    font-size: 17px; font-weight: 500; letter-spacing: -0.02em;
    color: #1a1a1a;
  }
  .sn-logo-dot { color: #6b6b6b; font-weight: 300; }
  .sn-links { display: flex; align-items: center; gap: 4px; }
  .sn-link {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 13px; border-radius: 10px;
    font-size: 13.5px; font-weight: 400;
    color: #6b6b6b; text-decoration: none;
    transition: all 0.18s ease;
    border: 1px solid transparent;
  }
  .sn-link:hover { color: #1a1a1a; background: rgba(0,0,0,0.04); }
  .sn-link.active {
    color: #1a1a1a; font-weight: 500;
    background: #fff; border-color: rgba(0,0,0,0.08);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .sn-mobile-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: rgba(245,244,240,0.94);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0,0,0,0.07);
    display: grid; grid-template-columns: repeat(4,1fr);
    font-family: 'DM Sans', -apple-system, sans-serif;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .sn-mobile-link {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 4px;
    padding: 12px 4px;
    font-size: 10px; font-weight: 400;
    color: #aaa; text-decoration: none;
    transition: color 0.18s ease;
  }
  .sn-mobile-link.active { color: #1a1a1a; font-weight: 500; }
  .sn-mobile-link svg { transition: transform 0.18s ease; }
  .sn-mobile-link.active svg { transform: scale(1.1); }
  @media (max-width: 640px) { .sn-links { display: none; } }
  @media (min-width: 641px) { .sn-mobile-bar { display: none; } }
`;

export default function Navbar() {
  const location = useLocation();
  return (
    <>
      <style>{style}</style>
      <nav className="sn-nav">
        <div className="sn-nav-inner">
          <Link to="/" className="sn-logo">
            Shop<span className="sn-logo-dot">Nest</span>
          </Link>
          <div className="sn-links">
            {NAV.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className={`sn-link ${location.pathname === to ? "active" : ""}`}>
                <Icon size={16} strokeWidth={location.pathname === to ? 2 : 1.8} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="sn-mobile-bar">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`sn-mobile-link ${location.pathname === to ? "active" : ""}`}>
            <Icon size={22} strokeWidth={location.pathname === to ? 2 : 1.6} />
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}