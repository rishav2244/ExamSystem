import { useNavigate } from "react-router-dom"
import { SearchBar } from "../barType/SearchBar"

import styles from "./css/AdminSubmissionsHeader.module.css"
import { useEffect, useState } from "react"

export const AdminSubmissionsHeader = ({ searchQuery }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const DEBOUNCE_DELAY = 500;

    useEffect(() => {
        const timer = setTimeout(() => {
            searchQuery(searchTerm);
        }, DEBOUNCE_DELAY);
        
        return () => clearTimeout(timer);
    }, [searchTerm, searchQuery]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    return (
        <div className={styles.headerOverall}>
            <h2>Exam Submissions</h2>
            <div className={styles.rightItems}>
                <SearchBar
                    handleQueryChange={handleSearchChange}
                    placeholderText={"Search for exam"}
                    searchBar={searchTerm} 
                />
            </div>
        </div>
    );
};