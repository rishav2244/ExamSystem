import { useEffect, useState } from "react";
import { SearchBar } from "../barType/SearchBar";

export const AdminGroupHeader = ({
    searchBar,
    setIsCreateModalOpen,
    groupCount
}) => {
    const [searchElement, setSearchElement] = useState("");
    const DEBOUNCE_DELAY = 500;

    useEffect(() => {
        const timer = setTimeout(() => {
            searchBar(searchElement);
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(timer);
    }, [searchElement, searchBar]);

    const handleQueryChange = (e) => {
        setSearchElement(e.target.value);
    };

    return (
        <div className="AdminUserHeader"> {/* Reusing structural layout class names */}
            <h2>Groups {groupCount !== undefined && `(Total: ${groupCount})`}</h2>

            <div className="AdminHeaderActions">
                <SearchBar
                    handleQueryChange={handleQueryChange}
                    placeholderText={"Search for group..."}
                    searchBar={searchElement}
                />
                <button className="CreateUserBtn" onClick={() => setIsCreateModalOpen(true)}>
                    + Create Group
                </button>
            </div>
        </div>
    );
};