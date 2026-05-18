import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/headerType/AdminSidebar";

export const AdminLayout = () => {
    return (
        <div className="AdminOverall" style={{ display: "flex", minHeight: "100vh" }}>
            {/* Left fixed sidebar */}
            <AdminSidebar />
            
            {/* Right main scrollable content area */}
            <div 
                className="AdminContent" 
                style={{ 
                    flex: 1, 
                    marginLeft: "260px", /* Matches the exact width of the sidebar */
                    padding: "32px",     /* Clean breathing room for tables and statistics panels */
                    boxSizing: "border-box",
                    backgroundColor: "#f8fafc", /* Light gray background so dashboard widgets pop nicely */
                    minHeight: "100vh"
                }}
            >
                <Outlet />
            </div>
        </div>
    );
};