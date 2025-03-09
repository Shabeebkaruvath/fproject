import { useState, useEffect } from "react";
import { ShoppingCart, LogOut, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

function Profile() {
  const user = {
    name: "Sample Name",
    email: "sample@email.com",
    number: "1234567890",
    username: "sampleUser",
    avatarUrl: "https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000",
  };

  const navigate = useNavigate();
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [userEmail, setUserEmail] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUsername(user.name || user.email.split('@')[0]);
      } else {
        setUserEmail(null);
        setUsername(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4 mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#e0e0e0] shadow-sm transition-transform duration-300 hover:scale-105">
            <img src={user.avatarUrl} alt={username} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col items-center sm:items-start sm:ml-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2e4156]">{username || "Loading..."}</h2>
            <Link 
              to="/profile"
              className="text-xs sm:text-sm text-[#2e4156] hover:text-blue-600 flex items-center space-x-1 mt-1 sm:mt-2"
            >
              <Edit size={14} />
              <span>Edit</span>
            </Link>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-[#f5f5f5] p-3 sm:p-4 rounded-lg border border-[#e0e0e0] backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-[#666666] text-xs sm:text-sm">
              <span className="font-medium text-[#2e4156]">Email:</span> {userEmail || "Loading..."}
            </p>
            <p className="text-[#666666] text-xs sm:text-sm">
              <span className="font-medium text-[#2e4156]">Last Login:</span> {formattedDate}
            </p>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4">
          <Link 
            to="/cart"
            className="flex items-center justify-center space-x-2 p-2 bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-lg transition-all duration-300 text-[#2e4156] hover:text-[#2e4156] border border-[#e0e0e0] hover:border-[#cccccc]"
          >
            <ShoppingCart className="text-[#64b5f6]" size={20} />
            <span className="text-xs sm:text-sm font-medium">Cart</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 p-2 bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-lg transition-all duration-300 text-[#2e4156] hover:text-[#2e4156] border border-[#e0e0e0] hover:border-[#cccccc]"
          >
            <LogOut className="text-[#64b5f6]" size={20} />
            <span className="text-xs sm:text-sm font-medium">LogOut</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;