import { useEffect, useState } from "react"
import { SearchBar } from "../barType/SearchBar";

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

    const clearSearch = () => {
        setSearchTerm("");
    };

    const handleQueryChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="AdminExamHeader">
            <h2>Exams</h2>

            <SearchBar
                clearSearch={clearSearch}
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
    )
}
