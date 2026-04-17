export const SearchBar = ({
    searchBar,
    handleQueryChange,
    placeholderText,
    clearSearch
}) => {
    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder={placeholderText}
                value={searchBar}
                onChange={handleQueryChange}
            />
            {searchBar && (
                <button className="SearchClearBtn" onClick={clearSearch}>
                    &times;
                </button>
            )}
        </div>
    )
}
