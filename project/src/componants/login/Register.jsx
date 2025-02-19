import React, { useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';

const RegisterForm = ({ setStatelogin }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(true);
  const [cshow, setCshow] = useState(true);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userDoc = {
        email: formData.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userCredential.user.uid,
        isActive: true,
        role: 'user'
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
      setFormData({ email: '', password: '', confirmPassword: '' });
      alert('Registration successful!');
      setStatelogin=true
      navigate('/');

    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';

      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = err.message;
      }

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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0b1956] mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#0b1956]/20 placeholder-[#0b1956]/50 text-[#0b1956] focus:outline-none focus:ring-2 focus:ring-[#0b1956]/30 focus:border-[#0b1956] bg-[#faf3eb]/30 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0b1956] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'password' : 'text'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#0b1956]/20 placeholder-[#0b1956]/50 text-[#0b1956] focus:outline-none focus:ring-2 focus:ring-[#0b1956]/30 focus:border-[#0b1956] bg-[#faf3eb]/30 transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0b1956]/50 hover:text-[#0b1956]"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0b1956] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={cshow ? 'password' : 'text'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#0b1956]/20 placeholder-[#0b1956]/50 text-[#0b1956] focus:outline-none focus:ring-2 focus:ring-[#0b1956]/30 focus:border-[#0b1956] bg-[#faf3eb]/30 transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setCshow(!cshow)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0b1956]/50 hover:text-[#0b1956]"
                >
                  {cshow ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#0b1956] hover:bg-[#0b1956]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b1956] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center text-sm text-[#0b1956]/70">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#0b1956] hover:text-[#0b1956]/80 transition-colors duration-200">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;