import React, { useState, useEffect } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

const AUTH_KEY = "lrso_admin_auth";
const ROLE_KEY = "lrso_admin_role";

export const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [userRole, setUserRole] = useState(() => localStorage.getItem(ROLE_KEY) || "Staff");

  useEffect(() => {
    if (isLoggedIn) localStorage.setItem(AUTH_KEY, "true");
    else localStorage.removeItem(AUTH_KEY);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, userRole);
  }, [userRole]);

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setUserRole("Staff");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} currentUserRole={userRole} />;
};
