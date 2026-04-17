import { useEffect, useState } from "react"
import { SearchBar } from "../barType/SearchBar"

export const AdminUserHeader = ({
    searchBar,
    setIsCreateModalOpen,
    userCount
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
        <div className="AdminUserHeader">
            <h2>Users (Total: {userCount})</h2>

            <div className="AdminHeaderActions">
                <SearchBar
                    handleQueryChange={handleQueryChange}
                    placeholderText={"Search for user"}
                    searchBar={searchElement}
                />
                <button className="CreateUserBtn" onClick={() => setIsCreateModalOpen(true)}>
                    + Create User
                </button>
            </div>
        </div>
    )
}
