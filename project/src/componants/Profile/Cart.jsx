import React from 'react';
import { ShoppingCart } from 'lucide-react';

function Cart() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] via-[#d0d0d0]">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-5xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-300">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6 md:mb-8">
          <ShoppingCart className="text-red-500" size={32} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Cart
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="p-2 sm:p-4 md:p-6">Product</th>
                <th className="p-2 sm:p-4 md:p-6">Price</th>
                <th className="p-2 sm:p-4 md:p-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Add your product rows here */}
              <tr className="border-b border-gray-300 hover:bg-gray-200 transition-colors duration-300">
                <td className="p-2 sm:p-4 md:p-6 flex items-center space-x-3">
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Product Name"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-red-500 sm:w-20 sm:h-20"
                  />
                  <span className="font-medium text-gray-800">Product Name</span>
                </td>
                <td className="p-2 sm:p-4 md:p-6 font-semibold text-red-500">$99.99</td>
                <td className="p-2 sm:p-4 md:p-6">
                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-300">
                    Buy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center text-gray-500 py-4 sm:py-6 md:py-8">
          Your cart is empty
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">
            Total: $0.00
          </div>
          <button className="mt-4 sm:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
