import { Outlet } from "react-router-dom"
import { CandidateHeader } from "../components/headerType/CandidateHeader";
import styles from "./css/CandidateLayout.module.css"

export const CandidateLayout = () => {
    return (
        <div className={styles.CandidateOverall}>
            <CandidateHeader />
            <Outlet />
        </div>
    );
}