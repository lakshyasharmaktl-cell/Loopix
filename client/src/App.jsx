import React from 'react'
import Navbar from './Components/Navbar.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sign from './Components/Auth/Sign.jsx';
import Login from './Components/Auth/Login.jsx';
import Otpsection from './Components/Otp/Otpsection.jsx';
import Chats from './Components/Chatting/Chats.jsx';
import Friends from './Components/Friends/Friends.jsx';
import Snap from './Components/Snap/Snap.jsx';
import Profile from './Components/Profile/Profile.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/signup" element={<Sign />} />
          <Route path='/login' element={<Login />} />
          {/* Fixed: was /otp-verify but Sign navigates to /otp-verify/:id */}
          <Route path='/otp-verify/:id' element={<Otpsection />} />
          {/* Fixed: was element={Chats} (class ref) – must be element={<Chats />} (JSX) */}
          <Route path='/chats' element={<Chats />} />
          <Route path='/friends' element={<Friends />} />
          <Route path='/camera' element={<Snap />} />
          <Route path='/profile' element={<Profile />} />
          {/* Default redirect */}
          <Route path='/' element={<Login />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </BrowserRouter>
    </div>
  )
}
