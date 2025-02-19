import React from 'react';
import { ShoppingCart, Star, Trash2 } from 'lucide-react';

function Cart() {
  // Sample product data (you might want to use state or fetch from an API)
  const products = [
    {
      id: 1,
      name: 'Sample Keyboard',
      brand: 'Sample',
      type: 'Mechanical',
      layout: 'QWERTY',
      price: 99.99,
      rating: 4.5,
      image: "https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000"
    },
    // You can add more products here
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 flex justify-center items-center">
      <div className="
        bg-white 
        shadow-lg 
        rounded-2xl 
        w-full 
        max-w-4xl 
        p-6 
        border 
        border-blue-100
      ">
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingCart className="text-blue-500" size={32} />
          <h2 className="text-2xl font-bold text-blue-800">
            Your Cart
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 text-blue-700">
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Layout</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className="
                    border-b 
                    border-blue-100 
                    hover:bg-blue-50 
                    transition-colors 
                    duration-300
                  "
                >
                  <td className="p-3 flex items-center space-x-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="
                        w-12 
                        h-12 
                        rounded-full 
                        object-cover 
                        border-2 
                        border-blue-200
                      "
                    />
                    <span className="font-medium">{product.name}</span>
                  </td>
                  <td className="p-3">{product.brand}</td>
                  <td className="p-3">{product.type}</td>
                  <td className="p-3">{product.layout}</td>
                  <td className="p-3 font-semibold text-blue-600">${product.price}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span>{product.rating}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <button 
                      className="
                        text-red-500 
                        hover:text-red-600 
                        hover:bg-red-50 
                        p-2 
                        rounded-full 
                        transition-colors 
                        duration-300
                      "
                      title="Remove from cart"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            Your cart is empty
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-800">
            Total: ${products.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
          </div>
           
        </div>
      </div>
    </div>
  );
}

export default Cart;