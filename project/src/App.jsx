import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { auth } from './firebase/firebase'; // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import './App.css';
import Home from './componants/Home/Home';
import Footer from './componants/Footer/Footer';
import Navbar from './componants/Navbar/Navbar';
import Profile from './componants/Profile/Profile';
import Cart from './componants/Profile/Cart';
import Feedback from './componants/Feedback/Feedback';
import Login from './componants/login/Login';
import Register from './componants/login/Register';

function App() {
  const [statelogin, setStatelogin] = useState(false); // Manage login state
  const [loading, setLoading] = useState(true); // Add a loading state

  // Use useEffect to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStatelogin(true); // User is logged in
      } else {
        setStatelogin(false); // User is logged out
      }
      setLoading(false); // Set loading to false once the auth state is determined
    });

    return () => unsubscribe(); // Cleanup the observer on unmount
  }, []);

  // Show a loading spinner while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <AppContent statelogin={statelogin} setStatelogin={setStatelogin} />
    </Router>
  );
}

function AppContent({ statelogin, setStatelogin }) {
  const location = useLocation();

  return (
    <div className="App">
      {/* Render Navbar only if the user is logged in and not on login/register pages */}
      {statelogin && location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}

      <Routes>
        {/* Protect routes with conditional rendering */}
        <Route path="/" element={statelogin ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={statelogin ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/feedback" element={statelogin ? <Feedback /> : <Navigate to="/login" />} />
        <Route path="/cart" element={statelogin ? <Cart /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={statelogin ? <Cart /> : <Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login setStatelogin={setStatelogin} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {statelogin && location.pathname !== '/login' && location.pathname !== '/register' && <Footer/>}
    </div>
  );
}

export default App;