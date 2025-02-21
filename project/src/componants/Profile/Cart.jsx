import React from 'react';
import { ShoppingCart, Star, Trash2 } from 'lucide-react';

function Cart() {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f0c29] to-[#302b63] via-[#24243e]">
      <div className="bg-gray-800 shadow-2xl rounded-3xl w-full max-w-5xl p-8 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingCart className="text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-white">
            Your Cart
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Brand</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Layout</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Rating</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  className="border-b border-blue-700 hover:bg-blue-800 transition-colors duration-300"
                >
                  <td className="p-4 flex items-center space-x-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-16 h-16 rounded-lg object-cover border-2 border-blue-500"
                    />
                    <span className="font-medium text-white">{product.name}</span>
                  </td>
                  <td className="p-4 text-gray-300">{product.brand}</td>
                  <td className="p-4 text-gray-300">{product.type}</td>
                  <td className="p-4 text-gray-300">{product.layout}</td>
                  <td className="p-4 font-semibold text-blue-400">${product.price}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star size={16} fill="currentColor" />
                      <span>{product.rating}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      className="text-red-400 hover:text-red-600 hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full transition-colors duration-300"
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
          <div className="text-center text-gray-400 py-6">
            Your cart is empty
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Total: ${products.reduce((sum, product) => sum + product.price, 0).toFixed(2)}
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
