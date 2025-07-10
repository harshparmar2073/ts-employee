// In your App.js or Routes.js

// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    logout();
    navigate("/login");
  }, []);
  return null;
};

export default Logout;