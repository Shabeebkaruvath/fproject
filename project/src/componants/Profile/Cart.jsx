import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const cartRef = collection(db, "users", userId, "cart");
        try {
          const cartSnapshot = await getDocs(cartRef);
          const items = cartSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCartItems(items);
          calculateTotal(items);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
      }
    };

    fetchCartItems();
  }, []);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce((acc, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
      return acc + price;
    }, 0);
    setTotal(totalPrice.toFixed(2));
  };

  const handleRemoveItem = async (itemId) => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      try {
        await deleteDoc(doc(db, "users", userId, "cart", itemId));
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
        calculateTotal(cartItems.filter((item) => item.id !== itemId));
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#f9f9f9] to-[#e0e0e0] via-[#d0d0d0]">
  <div className="bg-white shadow-2xl rounded-3xl w-full max-w-5xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-300">
    <div className="flex items-center space-x-3 mb-4 sm:mb-6 md:mb-8">
      <ShoppingCart className="text-red-500" size={32} />
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Cart</h2>
    </div>

    <div className="overflow-x-auto">
    <table className="w-full border-collapse shadow-lg">
  <thead>
    <tr className="bg-gray-100 text-gray-800">
      <th className="p-4 text-left">Product</th>
      <th className="p-4 text-left">Price</th>
      <th className="p-4 text-left">Actions</th>
      <th className="p-4 text-left">Buy</th>
    </tr>
  </thead>
  <tbody>
    {cartItems.length > 0 ? (
      cartItems.map((item) => (
        <tr
          key={item.id}
          className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          <td className="p-4 flex items-center space-x-4">
            <img
              src={item.imgUrl}
              alt={item.title}
              className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300 shadow-md"
            />
            <span className="font-medium text-gray-800 text-lg">
              {item.title}
            </span>
          </td>
          <td className="p-4 font-semibold text-gray-700 text-lg">
            {item.price}
          </td>
          <td className="p-4">
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Remove
            </button>
          </td>
          <td className="p-4">
            <a href={item.buyUrl} target="_blank" rel="noreferrer">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Buy
              </button>
            </a>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" className="text-center p-4 text-lg font-semibold text-gray-500">
          Your cart is empty
        </td>
      </tr>
    )}
  </tbody>
</table>

    </div>

    {cartItems.length > 0 && (
      <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-xl sm:text-2xl font-bold text-gray-800">
          Total: ${total}
        </div>
        <button className="mt-4 sm:mt-0 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 text-lg">
          Checkout
        </button>
      </div>
    )}
 
  </div>
</div>
  );
}

export default Cart;
