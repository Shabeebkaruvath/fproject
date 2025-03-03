import React, { useState, useEffect } from 'react';
import { Home, User, MessageCircle, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart' },
    { to: '/feedback', icon: MessageCircle, label: 'Feedback' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-black/80'}
        hidden md:flex
      `}>
        <div className="container mx-auto">
          <div className="flex justify-between items-center p-4">
            <Link
              to="/"
              className="text-3xl text-white font-['Inter'] flex items-center gap-3 group"
              aria-label="Go to Home"
            >
              <span className="relative">ShopNest</span>
              <ShoppingCart className="transform group-hover:rotate-12 transition-transform duration-200" size={30} />
            </Link>
            
            <div className="flex items-center gap-6">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    relative group flex items-center gap-2 px-4 py-2
                    text-gray-200 hover:text-white transition-colors duration-300
                    ${location.pathname === to ? 'text-white' : ''}
                    rounded-md
                  `}
                  aria-label={label}
                >
                  <Icon className={`
                    transform group-hover:scale-110 transition-all duration-300
                    ${location.pathname === to ? 'text-blue-400' : ''}
                  `} size={20} />
                  <span className="relative">
                    {label}
                    <span className={`
                      absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400
                      group-hover:w-full transition-all duration-300
                      ${location.pathname === to ? 'w-full' : ''}
                    `}></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className={`
        md:hidden fixed top-0 left-0 w-full z-50 
        transition-all duration-300
        ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-[#2e4156]'}
      `}>
        <div className="flex justify-center items-center p-4">
          <Link
            to="/"
            className="text-2xl text-white font-['Inter'] flex items-center gap-2 group"
            aria-label="Go to Home"
          >
            <span>ShopNest</span>
            <ShoppingCart className="transform group-hover:rotate-12 transition-transform duration-300" size={24} />
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-lg z-50">
        <div className="grid grid-cols-4 gap-1">
        {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`
                  relative flex flex-col items-center justify-center
                  py-3 px-2 group
                  ${isActive ? 'text-blue-400' : 'text-gray-400'}
                `}
                aria-label={label}
              >
                <div className={`
                  absolute -top-3 left-1/2 transform -translate-x-1/2
                  w-12 h-12 bg-blue-500/10 rounded-full scale-0
                  group-hover:scale-100 transition-transform duration-300
                  ${isActive ? 'scale-100' : ''}
                `}></div>
                <Icon size={24} className={`
                  relative transform transition-all duration-300
                  group-hover:scale-110 group-hover:-translate-y-1
                  ${isActive ? 'scale-110 -translate-y-1' : ''}
                `} />
                <span className={`
                  mt-1 text-xs transform transition-all duration-300
                  group-hover:scale-110 group-hover:-translate-y-1
                  ${isActive ? 'scale-110 -translate-y-1' : ''}
                `}>
                  {label}
                </span>
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2
                  w-12 h-0.5 bg-blue-400 rounded-full scale-x-0
                  group-hover:scale-x-100 transition-transform duration-300
                  ${isActive ? 'scale-x-100' : ''}
                `}></div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer divs */}
      <div className="h-[72px]"></div> {/* For desktop navbar */}
      <div className="md:hidden h-[72px]"></div> {/* For mobile top bar */}
    </>
  );
};

export default Navbar;

