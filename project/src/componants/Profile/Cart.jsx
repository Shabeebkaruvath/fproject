import React, { useEffect, useState } from "react";
import { ShoppingCart,Trash2,ShoppingBag } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-5xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <ShoppingCart className="text-red-500" size={32} />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Cart
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden md:table w-full border-collapse shadow-md text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left"> </th>
                <th className="p-3 text-left"> </th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 flex items-center space-x-4">
                      <img
                        src={item.imgUrl}
                        alt={item.title}
                        className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-cover border border-gray-300 shadow-sm"
                      />
                      <span className="font-medium text-gray-800 text-sm sm:text-lg">
                        {item.title}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-700">
                      {item.price}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md text-sm sm:text-base hover:bg-red-700 transition duration-200"
                      >
                         <Trash2></Trash2>
                      </button>
                    </td>
                    <td className="p-3">
                      <a href={item.buyUrl} target="_blank" rel="noreferrer">
                        <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm sm:text-base hover:bg-blue-700 transition duration-200">
                          Buy
                        </button>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-4 text-lg font-semibold text-gray-500"
                  >
                    Your cart is empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile View - Grid Layout */}
          <div className="md:hidden grid gap-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-4 rounded-lg shadow flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
                >
                  <img
                    src={item.imgUrl}
                    alt={item.title}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-300 shadow-sm"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-medium text-gray-800 text-lg">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 font-bold text-lg">{item.price}</p>
                  </div>
                  <div className="flex flex-row sm:flex-row gap-2">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-red-700 transition duration-200 w-full sm:w-auto"
                    >
                      <Trash2></Trash2>
                    </button>
                    <a
                      href={item.buyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-blue-700 transition duration-200 w-full sm:w-auto">
                      <ShoppingBag></ShoppingBag>
                      </button>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-lg font-semibold text-gray-500">
                Your cart is empty
              </div>
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center font-3xl sm:text-3xl text-gray-800">
            <div className="text-lg sm:text-xl font-bold text-gray-800">
              Total: ${total}
            </div>
             
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
