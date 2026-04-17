import { useEffect, useState } from "react"
import { SearchBar } from "../barType/SearchBar";
import styles from "./css/AdminExamHeader.module.css"

export const AdminExamHeader = ({
    debouncedSearchTerm,
    setIsCreateModalOpen
}) => {

    const [searchTerm, setSearchTerm] = useState("");

    const DEBOUNCE_DELAY = 500;

    useEffect(() => {
        const timer = setTimeout(() => {
            debouncedSearchTerm(searchTerm);
        }, DEBOUNCE_DELAY)
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearchTerm]);

    const handleQueryChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={styles.AdminExamHeader}>
            <h2>Exams</h2>

            <div className={styles.rightItems}>
                <SearchBar
                    handleQueryChange={handleQueryChange}
                    placeholderText={"Search for exams"}
                    searchBar={searchTerm}
                />

                <button
                    className="CreateExamBtn"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    + Create Exam
                </button>
            </div>
        </div >
    )
}
