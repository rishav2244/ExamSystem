import { Outlet } from "react-router-dom"
import { AdminHeader } from "../components/headerType/AdminHeader"

export const AdminLayout = () => {
    return (
        <div className="AdminOverall">
            <AdminHeader />
            <div className="AdminContent">
                <Outlet />
            </div>
        </div>
    );
}
