import styles from "./css/SearchBar.module.css"

export const SearchBar = ({
    searchBar,
    handleQueryChange,
    placeholderText,
}) => {
    return (
        <div className={styles.searchContainer}>
            <input
                type="text"
                className={styles.searcgInput}
                placeholder={placeholderText}
                value={searchBar}
                onChange={handleQueryChange}
            />
        </div>
    )
}
