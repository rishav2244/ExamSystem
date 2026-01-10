import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthenticationContext } from "../context/AuthenticationContext";

export default function AdminRoute() {
    const { role } = useContext(AuthenticationContext);

    if (role !== "ADMIN") {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
}