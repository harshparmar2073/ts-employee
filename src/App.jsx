import React from 'react'
import Login from './pages/Login'
import { Routes, Route } from "react-router";
import ResetPassword from './components/ResetPassword';
import Signup from './components/CreateAccount';
import { CssBaseline } from '@mui/material';
import VerificationCodePage from './pages/VerificationCodePage';
import DashboardPage from './pages/DashboardPage';
import Membertable from './components/Member';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/verification-code" element={<VerificationCodePage/>}/>
        <Route path="/dashboard" element={<DashboardPage/>}/>
        <Route path="/member-table" element={<Membertable/>}/>
      </Routes>
    </>
  );
}

export default App