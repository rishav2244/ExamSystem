export const PageBar = ({
    currentPage,
    totalPages,
    handlePageChange
}) => {
    
    const onInputChange = (e) => {
        const val = parseInt(e.target.value, 10) - 1;
        if (!isNaN(val) && val >= 0 && val < totalPages) {
            handlePageChange(val);
        }
    };

    return (
        <div className="UserPagination">
            <button 
                disabled={currentPage === 0} 
                onClick={() => handlePageChange(currentPage - 1)}
            >
                Previous
            </button>
            
            <div className="page-jump-container">
                <span>Page</span>
                <input
                    type="number"
                    className="page-input"
                    value={currentPage + 1}
                    min="1"
                    max={totalPages}
                    onChange={onInputChange}
                />
                <span>of {totalPages}</span>
            </div>

            <button 
                disabled={currentPage >= totalPages - 1} 
                onClick={() => handlePageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
};