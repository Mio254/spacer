import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ roles }) {
  const { token, user } = useSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;

  // If roles specified, user must be loaded and match
  if (roles?.length) {
    if (!user) return null; // you can show a spinner
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
