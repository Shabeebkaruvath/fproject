import React from 'react';
import { ShoppingCart } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="hidden md:block bg-black/80 py-6 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-white">Shop</span>
            <span className="text-blue-500 font-semibold">Nest</span>
            <ShoppingCart className="text-blue-500 h-5 w-5 ml-1" />
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} ShopNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;