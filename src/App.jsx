import React from 'react'
import Login from './pages/Login'
import { Routes, Route } from "react-router";
import ResetPassword from './components/ResetPassword';
import Signup from './components/CreateAccount';
const App = () => {
  return (
    <div>
 <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/signup" element={<Signup/>}/>
 </Routes>
     
    </div>
  )
}

export default App