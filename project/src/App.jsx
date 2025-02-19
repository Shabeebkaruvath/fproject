import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Home from './componants/Home/Home';
import Navbar from './componants/Navbar/Navbar';
import Profile from './componants/Profile/Profile';
import Cart from './componants/Profile/Cart';
import Feedback from './componants/Feedback/Feedback';
import Login from './componants/login/Login';
import Register from './componants/login/Register';
 

function App() {
  const [statelogin, setStatelogin] = useState(false);  // Manage login state (false by default)

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
    

        {/* Public routes */}
        <Route path="/login" element={<Login setStatelogin={setStatelogin} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
