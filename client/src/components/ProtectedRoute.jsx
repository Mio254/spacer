import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ roles, children, redirectTo = "/login" }) {
  const { token, user } = useSelector((s) => s.auth);

  if (!token) return <Navigate to={redirectTo} replace />;

  if (roles?.length) {
    if (!user) return null; // optional: spinner
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  }

  
  return children ? children : <Outlet />;
}
