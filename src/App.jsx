import React from 'react'
import Login from './pages/Login'
import { Routes, Route } from "react-router";
import ResetPassword from './components/ResetPassword';
import Signup from './components/CreateAccount';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </>
  );
}

export default App