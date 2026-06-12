import React from 'react'
import Navbar from './Components/Navbar.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sign from './Components/Auth/Sign.jsx';
import Login from './Components/Auth/Login.jsx';
import Otpsection from './Components/Otp/Otpsection.jsx';
import Chats from './Components/Chatting/Chats.jsx';
import Friends from './Components/Friends/Friends.jsx'
export default function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/signup" element={<Sign />} />
          <Route path='/login' element={<Login/>} />
          <Route path='/otp-verify' element={<Otpsection/>} />
          <Route path='chats' element={Chats} />
          <Route path='friends' element={Friends} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
