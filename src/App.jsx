import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import ResetPassword from './components/ResetPassword';
import Signup from './components/CreateAccount';
import VerificationCodePage from './pages/VerificationCodePage';
import DashboardPage from './pages/DashboardPage';
import Membertable from './components/Member';
import Security from './components/Security';
import Layout from './theme/Layout';
import Logout from './pages/auth/Logout';
import AccountInfo from './components/AccontInfo';
import ProfileInfo from './components/ProfileInfo';
import EmployeeContractorForm from './components/EmployeeContractForm';
import CalendarView from './components/Calendar-View';
import './App.css';

const userData = {
  name: 'John Doe',
  initials: 'JD',
  email: 'john.doe@example.com'
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verification-code" element={<VerificationCodePage />} />
      <Route path="/dashboard" element={<Layout userData={userData} />}>
        <Route path="dashboard-content" element={<DashboardPage />} />
        <Route path="security" element={<Security />} />
        <Route path="member-table" element={<Membertable />} />
        <Route path="account-info" element={<AccountInfo/>}/>
        <Route path="profile-info" element={<ProfileInfo/>}/>
        <Route path="employee-contract-form" element={<EmployeeContractorForm/>}/>
        <Route path="calendar-view" element={<CalendarView/>}/>


        {/* Optionally, redirect /dashboard to /dashboard/dashboard-content */}
        {/* <Route index element={<Navigate to="dashboard-content" replace />} /> */}
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route path="/logout" element={<Logout />} />

    </Routes>
  );
}