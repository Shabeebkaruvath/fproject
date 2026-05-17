import React from 'react';

const s = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
  .sn-footer { background: #f5f4f0; border-top: 1px solid rgba(0,0,0,0.07); padding: 20px 24px; font-family: 'DM Sans',sans-serif; display:none; }
  .sn-footer-inner { max-width: 1200px; margin: 0 auto; display:flex; align-items:center; justify-content:space-between; }
  .sn-footer-logo { font-size: 14px; font-weight: 500; color: #1a1a1a; letter-spacing: -0.01em; }
  .sn-footer-copy { font-size: 12px; color: #aaa; }
  @media (min-width: 641px) { .sn-footer { display: block; } }
`;

export default function Footer() {
  return (
    <>
      <style>{s}</style>
      <footer className="sn-footer">
        <div className="sn-footer-inner">
          <span className="sn-footer-logo">ShopNest</span>
          <span className="sn-footer-copy">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
}