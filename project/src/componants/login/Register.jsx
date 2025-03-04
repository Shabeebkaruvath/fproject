import React, { useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
  id,
  type,
  name,
  placeholder,
  value,
  onChange,
  disabled,
  showPasswordToggle,
  toggleShowPassword,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#0b1956] mb-1">
      {placeholder}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="appearance-none rounded-lg block w-full px-4 py-3 border border-[#0b1956]/20 placeholder-[#0b1956]/50 text-[#0b1956] focus:outline-none focus:ring-2 focus:ring-[#0b1956]/30 focus:border-[#0b1956] bg-[#faf3eb]/30 transition-colors duration-200"
        required
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0b1956]/50 hover:text-[#0b1956]"
        >
          {type === 'text' ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  </div>
);

const LoadingSpinner = () => (
  <span className="flex items-center">
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    Creating account...
  </span>
);

const RegisterForm = ({ setStateLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Create user authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userId = userCredential.user.uid;
      const timestamp = new Date().toISOString();

      // User document data
      const userDoc = {
        email: formData.email,
        createdAt: timestamp,
        updatedAt: timestamp,
        userId: userId,
        isActive: true,
        role: 'user',
      };

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userId), userDoc);

      // Create cart collection for the user
      const userCartCollectionRef = collection(db, 'users', userId, 'cart');

      // Create an initial empty cart document
      await addDoc(userCartCollectionRef, {
        createdAt: timestamp,
        items: [], // Start with an empty items array
        totalItems: 0,
        totalPrice: 0,
      });

      // Reset form state
      setFormData({ email: '', password: '', confirmPassword: '' });
      console.log("Registration successful! User and cart created with ID:", userId);

      if (typeof setStateLogin === 'function') {
        setStateLogin(true);
      }

      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error("Registration error:", err.code, err.message);

      // Error handling
      const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'permission-denied': 'Permission denied. Please check your Firebase security rules.',
      };
      const errorMessage = errorMessages[err.code] || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf3eb] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:scale-[1.01]">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-[#0b1956]">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-[#0b1956]/70">
            Join us today and get started
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <InputField
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />

            <InputField
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              showPasswordToggle={true}
              toggleShowPassword={() => setShowPassword(!showPassword)}
            />

            <InputField
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              showPasswordToggle={true}
              toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0b1956] hover:bg-[#0b1956]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1956] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? <LoadingSpinner /> : 'Create Account'}
          </button>

          <div className="text-center text-sm text-[#0b1956]/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#0b1956] hover:text-[#0b1956]/80 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
