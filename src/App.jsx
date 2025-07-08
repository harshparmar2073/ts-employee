import React from 'react'
import Login from './pages/Login'
import { Routes, Route } from "react-router";
import ResetPassword from './components/ResetPassword';
import Signup from './components/CreateAccount';
import { CssBaseline } from '@mui/material';
import VerificationCodePage from './pages/VerificationCodePage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/verification-code" element={<VerificationCodePage/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </>
  );
}

export default App