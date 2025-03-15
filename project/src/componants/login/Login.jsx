import React, { useState } from 'react';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log(userCredential);
      navigate('/');
      alert('login successfully')  // Redirect to home page after successful login

    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';

      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'check internet connection.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faebee] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:scale-[1.01]">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-[#333d7a]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[#333d7a]/70">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#333d7a] mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#333d7a]/20 placeholder-[#333d7a]/50 text-[#333d7a] focus:outline-none focus:ring-2 focus:ring-[#333d7a]/30 focus:border-[#333d7a] bg-[#faebee]/20 transition-colors duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#333d7a] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-[#333d7a]/20 placeholder-[#333d7a]/50 text-[#333d7a] focus:outline-none focus:ring-2 focus:ring-[#333d7a]/30 focus:border-[#333d7a] bg-[#faebee]/20 transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#333d7a]/50 hover:text-[#333d7a]"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#333d7a] hover:bg-[#333d7a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#333d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="text-center text-sm text-[#333d7a]/70">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#333d7a] hover:text-[#333d7a]/80 transition-colors duration-200">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;