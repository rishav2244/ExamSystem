import { Outlet } from "react-router-dom";
import { CandidateHeader } from "../components/headerType/CandidateHeader";
import styles from "./css/CandidateLayout.module.css";

export const CandidateLayout = () => {
    return (
        <div className={styles.CandidateOverall}>
            {/* The Header now acts as the Left Sidebar component */}
            <CandidateHeader />
            
            {/* Main content body panel */}
            <main className={styles.mainContentArea}>
                <Outlet />
            </main>
        </div>
    );
};