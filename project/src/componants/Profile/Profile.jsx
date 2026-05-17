import { useState, useEffect } from "react";
import { ShoppingCart, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const AVATAR_URL = "https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000";

function Profile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        // Firebase Auth stores the display name in user.displayName (not user.name)
        setUsername(user.displayName || user.email.split('@')[0]);
        setLastLogin(
          user.metadata.lastSignInTime
            ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
            : null
        );
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4 mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#e0e0e0] shadow-sm transition-transform duration-300 hover:scale-105">
            <img src={AVATAR_URL} alt={username || "User"} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col items-center sm:items-start sm:ml-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2e4156]">
              {username || "Loading..."}
            </h2>
          </div>
        </div>

        <div className="bg-[#f5f5f5] p-3 sm:p-4 rounded-lg border border-[#e0e0e0]">
          <div className="space-y-2">
            <p className="text-[#666666] text-xs sm:text-sm">
              <span className="font-medium text-[#2e4156]">Email:</span>{" "}
              {userEmail || "Loading..."}
            </p>
            {lastLogin && (
              <p className="text-[#666666] text-xs sm:text-sm">
                <span className="font-medium text-[#2e4156]">Last Login:</span>{" "}
                {lastLogin}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4">
          <Link
            to="/cart"
            className="flex items-center justify-center space-x-2 p-2 bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-lg transition-all duration-300 text-[#2e4156] border border-[#e0e0e0] hover:border-[#cccccc]"
          >
            <ShoppingCart className="text-[#64b5f6]" size={20} />
            <span className="text-xs sm:text-sm font-medium">Cart</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 p-2 bg-[#f5f5f5] hover:bg-[#e0e0e0] rounded-lg transition-all duration-300 text-[#2e4156] border border-[#e0e0e0] hover:border-[#cccccc]"
          >
            <LogOut className="text-[#64b5f6]" size={20} />
            <span className="text-xs sm:text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;