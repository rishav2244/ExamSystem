import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";

export default function ProtectedRoute() {
  const { isLoggedIn } = useContext(AuthenticationContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}