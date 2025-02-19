import React, { useState } from 'react';
import { Home, User, X, AlignJustify, MessageCircle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/feedback', icon: MessageCircle, label: 'Feedback' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-[#2e4156] shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link 
            to="/" 
            className="text-3xl text-[#d4d8dd] font-['Open_Sans'] flex items-center gap-2 hover:text-white transition-colors"
          >
            <span>ShopNest</span>
            <ShoppingCart size={30}/>
          </Link>

          <button 
            className="md:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <AlignJustify size={24} />}
          </button>

          <div 
            className={`
              fixed md:static top-[72px] left-0
              w-full md:w-auto 
              bg-[#2e4156] md:bg-transparent
              shadow-md md:shadow-none
              transition-transform duration-300 ease-in-out
              ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              z-40
            `}
          >
            <div className="container mx-auto md:flex md:items-center md:gap-4 p-4 md:p-0">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className="
                    block md:inline-flex items-center
                    p-3 md:p-2
                    mb-2 md:mb-0
                    text-white hover:text-gray-300
                    hover:bg-[#3a4f68] md:hover:bg-transparent
                    rounded transition-colors
                    w-full md:w-auto
                  "
                >
                  <Icon className="mr-2" size={20} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer div to prevent content from going under navbar */}
      <div className="h-[72px]"></div>
    </>
  );
};

export default Navbar;