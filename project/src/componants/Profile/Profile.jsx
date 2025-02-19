import React from "react";
import { ShoppingCart, LogOut, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

function Profile() {
  const user = {
    name: "Sample Name",
    email: "sample@email.com",
    number: "1234567890",
    avatarUrl: "https://img.icons8.com/?size=100&id=z-JBA_KtSkxG&format=png&color=000000",
  };
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');  // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
      // You might want to show an error notification to the user here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#e6e6e6]">
      <div className="
        shadow-lg 
        rounded-2xl 
        w-full 
        max-w-md 
        p-6 
        space-y-6 
        border 
        border-blue-100
      ">
        {/* Profile Header */}
        <div className="flex items-center space-x-6">
          <div className="
            w-24 
            h-24 
            rounded-full 
            overflow-hidden 
            border-4 
            border-blue-200 
            shadow-md
          ">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h2 className="
              text-2xl 
              font-bold 
              text-[#2e4156]
              mb-2
            ">
              {user.name}
            </h2>
            <Link 
              to="/edit-profile" 
              className="
                flex 
                items-center 
                text-[#2e4156]
                hover:text-blue-600 
                text-sm 
                space-x-1
              "
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* User Details */}
        <div className="
          bg-blue-50 
          p-4 
          rounded-lg 
          border 
          border-blue-100
        ">
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold text-[#2e4156]">Email:</span> {user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-[#2e4156]">Mobile:</span> {user.number}
            </p>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/cart" 
            className="
              flex 
              items-center 
              space-x-2 
              p-3 
              bg-blue-50 
              hover:bg-blue-100 
              rounded-lg 
              transition-colors 
              duration-300 
              text-[#2e4156]
              hover:bg-[#2e4156]  
              hover:text-[#fff]
            "
          >
            <ShoppingCart className="text-[#64b5f6] hover:text-[#fff]" size={24} />
            <span className="font-medium">Cart</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="
              flex 
              items-center 
              space-x-2 
              p-3 
              bg-blue-50 
              hover:bg-blue-100 
              rounded-lg 
              transition-colors 
              duration-300 
              text-[#2e4156]
              hover:bg-[#2e4156]  
              hover:text-[#fff]
            "
          >
            <LogOut className="text-[#64b5f6] hover:text-[#fff]" size={24} />
            <span className="font-medium">LogOut</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;